import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trip, tripLocation } from "@/lib/db/schema";

interface RouteParams {
  params: Promise<{ tripId: string }>;
}

interface LocationInput {
  latitude: number;
  longitude: number;
  speed?: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  capturedAt: number;
}

// POST /api/trips/[tripId]/locations - Batch upload locations
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

    const body = await request.json();
    const locations: LocationInput[] = body.locations;

    if (!Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: "locations array is required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const locationRecords = locations.map((loc) => ({
      id: crypto.randomUUID(),
      tripId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      speed: loc.speed ?? null,
      altitude: loc.altitude ?? null,
      accuracy: loc.accuracy ?? null,
      heading: loc.heading ?? null,
      capturedAt: loc.capturedAt,
      createdAt: now,
    }));

    await db.insert(tripLocation).values(locationRecords);

    return NextResponse.json(
      { inserted: locationRecords.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting locations:", error);
    return NextResponse.json(
      { error: "Failed to insert locations" },
      { status: 500 }
    );
  }
}

// GET /api/trips/[tripId]/locations - Get all locations for a trip
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

    const locations = await db
      .select()
      .from(tripLocation)
      .where(eq(tripLocation.tripId, tripId))
      .orderBy(asc(tripLocation.capturedAt));

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
