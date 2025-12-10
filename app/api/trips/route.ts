import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trip } from "@/lib/db/schema";

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const now = Date.now();

    const newTrip = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      startedAt: body.startedAt || now,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(trip).values(newTrip);

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}

// GET /api/trips - List user's trips
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trips = await db
      .select()
      .from(trip)
      .where(eq(trip.userId, session.user.id))
      .orderBy(desc(trip.startedAt));

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
