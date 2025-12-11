import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trip, tripEvent } from "@/lib/db/schema";
import { calculateTripScore } from "@/lib/scoring";

interface RouteParams {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId] - Get a single trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;

    const [foundTrip] = await db
      .select()
      .from(trip)
      .where(and(eq(trip.id, tripId), eq(trip.userId, session.user.id)));

    if (!foundTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(foundTrip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// PATCH /api/trips/[tripId] - Update a trip
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;
    const body = await request.json();

    // Verify trip belongs to user
    const [existingTrip] = await db
      .select()
      .from(trip)
      .where(and(eq(trip.id, tripId), eq(trip.userId, session.user.id)));

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const updateData: Partial<typeof trip.$inferInsert> = {
      updatedAt: Date.now(),
    };

    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.endedAt !== undefined) {
      updateData.endedAt = body.endedAt;
    }
    if (body.totalDistance !== undefined) {
      updateData.totalDistance = body.totalDistance;
    }
    if (body.averageSpeed !== undefined) {
      updateData.averageSpeed = body.averageSpeed;
    }

    // Calculate score when trip is completed
    if (body.status === "completed" && body.endedAt) {
      const tripDuration = body.endedAt - existingTrip.startedAt;

      // Fetch all events for this trip
      const events = await db
        .select()
        .from(tripEvent)
        .where(eq(tripEvent.tripId, tripId));

      // Calculate score
      const tripScore = calculateTripScore(
        events.map((e) => ({
          id: e.id,
          tripId: e.tripId,
          eventType: e.eventType,
          offset: e.offset,
          timestamp: existingTrip.startedAt + e.offset * 1000,
          imageUrl: e.imageUrl,
          confidence: e.confidence,
          metadata: e.metadata,
          createdAt: e.createdAt,
          videoClip: null,
        })),
        tripDuration,
      );

      updateData.score = tripScore.score;
    }

    await db.update(trip).set(updateData).where(eq(trip.id, tripId));

    const [updatedTrip] = await db
      .select()
      .from(trip)
      .where(eq(trip.id, tripId));

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}
