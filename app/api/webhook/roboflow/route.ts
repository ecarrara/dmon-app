import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { trip, tripEvent } from "@/lib/db/schema";
import { uploadEventImage } from "@/lib/s3";

/**
 * POST /api/webhook/roboflow?tripId={tripId}
 *
 * Roboflow webhook sink for handling AI detection events
 *
 * Query params:
 * - tripId: ID of the trip to associate the event with
 *
 * Form data:
 * - image: JPEG image file of the detection
 * - offset: Number of seconds since the start of the trip
 * - prediction: Detected class name (e.g., "Drowsy eye", "Yawn", "phone")
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get tripId from query string
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("trip_id");

    if (!tripId) {
      return NextResponse.json(
        { error: "trip_id query parameter is required" },
        { status: 400 },
      );
    }

    // 2. Verify trip exists (basic validation)
    const [existingTrip] = await db
      .select()
      .from(trip)
      .where(eq(trip.id, tripId))
      .limit(1);

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const offsetStr = formData.get("offset") as string | null;
    const prediction = formData.get("prediction") as string | null;

    // 4. Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: "image file is required" },
        { status: 400 },
      );
    }

    if (!offsetStr) {
      return NextResponse.json(
        { error: "offset is required" },
        { status: 400 },
      );
    }

    if (!prediction) {
      return NextResponse.json(
        { error: "prediction is required" },
        { status: 400 },
      );
    }

    const offset = parseFloat(offsetStr);
    if (isNaN(offset)) {
      return NextResponse.json(
        { error: "offset must be a valid number" },
        { status: 400 },
      );
    }

    // 5. Upload image to S3
    const eventId = crypto.randomUUID();
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageUrl = await uploadEventImage(
      tripId,
      eventId,
      imageBuffer,
      image.type,
    );

    // 6. Store event in database
    const now = Date.now();
    const eventRecord = {
      id: eventId,
      tripId,
      eventType: prediction,
      offset,
      imageUrl,
      confidence: null, // Can be extended later
      metadata: null, // Can be extended later
      createdAt: now,
    };

    await db.insert(tripEvent).values(eventRecord);

    // 7. Return success response
    return NextResponse.json(
      {
        id: eventId,
        tripId,
        eventType: prediction,
        offset,
        imageUrl,
        createdAt: now,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing Roboflow webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
