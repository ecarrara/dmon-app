import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and, avg, sum, count, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trip, tripEvent } from "@/lib/db/schema";

// GET /api/trips/stats - Get aggregated trip statistics
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get average score and total driving time from completed trips
    const [tripStats] = await db
      .select({
        averageScore: avg(trip.score),
        totalMs: sum(sql<number>`${trip.endedAt} - ${trip.startedAt}`),
      })
      .from(trip)
      .where(and(eq(trip.userId, userId), eq(trip.status, "completed")));

    // Count total events from user's completed trips
    const [eventStats] = await db
      .select({
        totalEvents: count(tripEvent.id),
      })
      .from(tripEvent)
      .innerJoin(trip, eq(tripEvent.tripId, trip.id))
      .where(and(eq(trip.userId, userId), eq(trip.status, "completed")));

    const averageScore = Math.round(Number(tripStats?.averageScore) || 0);
    const totalMinutes = Math.round(
      (Number(tripStats?.totalMs) || 0) / 1000 / 60
    );
    const totalEvents = Number(eventStats?.totalEvents) || 0;

    return NextResponse.json({
      averageScore,
      totalMinutes,
      totalEvents,
    });
  } catch (error) {
    console.error("Error fetching trip stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip stats" },
      { status: 500 }
    );
  }
}
