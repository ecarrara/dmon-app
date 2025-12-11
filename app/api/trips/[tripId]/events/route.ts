import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trip, tripEvent, tripVideoClip } from "@/lib/db/schema";
import { getPresignedEventImageUrl, getPresignedClipUrl } from "@/lib/s3";

interface RouteParams {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/events - Get all events for a trip with matching video clips
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

    // Fetch all events for the trip
    const events = await db
      .select()
      .from(tripEvent)
      .where(eq(tripEvent.tripId, tripId))
      .orderBy(asc(tripEvent.offset));

    // Fetch all video clips for the trip
    const clips = await db
      .select()
      .from(tripVideoClip)
      .where(eq(tripVideoClip.tripId, tripId))
      .orderBy(asc(tripVideoClip.startTime));

    // Match events with video clips and generate presigned URLs
    const eventsWithClips = await Promise.all(
      events.map(async (event) => {
        // Calculate event absolute timestamp (ms)
        const eventTimestamp = existingTrip.startedAt + event.offset * 1000;

        // Find matching video clip
        const matchingClip = clips.find(
          (clip) =>
            clip.startTime <= eventTimestamp && eventTimestamp <= clip.endTime,
        );

        // Generate presigned URL for event image if it exists
        let imageUrl = null;
        if (event.imageUrl) {
          // Extract tripId and eventId from the stored URL pattern
          // Format: https://bucket.region.domain/events/{tripId}/{eventId}.jpg
          imageUrl = await getPresignedEventImageUrl(tripId, event.id);
        }

        // Build video clip response with presigned URL
        let videoClip = null;
        if (matchingClip && matchingClip.fileUrl) {
          const clipFileUrl = await getPresignedClipUrl(
            tripId,
            matchingClip.id,
          );

          videoClip = {
            id: matchingClip.id,
            startTime: matchingClip.startTime,
            endTime: matchingClip.endTime,
            duration: matchingClip.duration,
            fileUrl: clipFileUrl,
            status: matchingClip.status,
          };
        }

        return {
          id: event.id,
          tripId: event.tripId,
          eventType: event.eventType,
          offset: event.offset,
          timestamp: eventTimestamp,
          imageUrl,
          confidence: event.confidence,
          metadata: event.metadata,
          createdAt: event.createdAt,
          videoClip,
        };
      }),
    );

    return NextResponse.json({ events: eventsWithClips });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
