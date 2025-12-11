import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trip, tripVideoClip } from "@/lib/db/schema";
import { uploadVideoClip, getPresignedUploadUrl } from "@/lib/s3";

interface RouteParams {
  params: Promise<{ tripId: string }>;
}

// POST /api/trips/[tripId]/clips - Upload a video clip or get presigned URL
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;

    // Verify trip belongs to user and is active
    const [existingTrip] = await db
      .select()
      .from(trip)
      .where(and(eq(trip.id, tripId), eq(trip.userId, session.user.id)));

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (existingTrip.status !== "active") {
      return NextResponse.json(
        { error: "Trip is not active" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    const now = Date.now();
    const clipId = crypto.randomUUID();

    // Check if this is a request for a presigned URL
    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (body.getPresignedUrl) {
        // Generate presigned URL for direct upload
        const presignedUrl = await getPresignedUploadUrl(tripId, clipId);

        // Create clip record with uploading status
        const clipRecord = {
          id: clipId,
          tripId,
          startTime: body.startTime,
          endTime: body.endTime,
          duration: body.duration || Math.floor((body.endTime - body.startTime) / 1000),
          status: "processed" as const,
          createdAt: now,
        };

        await db.insert(tripVideoClip).values(clipRecord);

        return NextResponse.json(
          {
            id: clipId,
            presignedUrl,
            status: "processed",
          },
          { status: 201 }
        );
      }
    }

    // Handle multipart form data upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const video = formData.get("video") as File | null;
      const startTime = parseInt(formData.get("startTime") as string);
      const endTime = parseInt(formData.get("endTime") as string);

      if (!video) {
        return NextResponse.json(
          { error: "video file is required" },
          { status: 400 }
        );
      }

      if (isNaN(startTime) || isNaN(endTime)) {
        return NextResponse.json(
          { error: "startTime and endTime are required" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await video.arrayBuffer());
      const fileUrl = await uploadVideoClip(tripId, clipId, buffer, video.type);

      const clipRecord = {
        id: clipId,
        tripId,
        startTime,
        endTime,
        duration: Math.floor((endTime - startTime) / 1000),
        fileUrl,
        fileSize: buffer.length,
        status: "processed" as const,
        createdAt: now,
      };

      await db.insert(tripVideoClip).values(clipRecord);

      return NextResponse.json(
        {
          id: clipId,
          fileUrl,
          status: "processed",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error uploading clip:", error);
    return NextResponse.json(
      { error: "Failed to upload clip" },
      { status: 500 }
    );
  }
}

// GET /api/trips/[tripId]/clips - List clips for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;

    // Verify trip belongs to user
    const [existingTrip] = await db
      .select()
      .from(trip)
      .where(and(eq(trip.id, tripId), eq(trip.userId, session.user.id)));

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const clips = await db
      .select()
      .from(tripVideoClip)
      .where(eq(tripVideoClip.tripId, tripId))
      .orderBy(asc(tripVideoClip.startTime));

    return NextResponse.json({ clips });
  } catch (error) {
    console.error("Error fetching clips:", error);
    return NextResponse.json(
      { error: "Failed to fetch clips" },
      { status: 500 }
    );
  }
}
