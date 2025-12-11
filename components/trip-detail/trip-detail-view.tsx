"use client";

import { useState, useEffect } from "react";
import { TripHeader } from "./trip-header";
import { TripScoreCard } from "./trip-score-card";
import { TripStatsCards } from "./trip-stats-cards";
import { TripEventsList } from "./trip-events-list";
import { TripEventsSummary } from "./trip-events-summary";
import { TripSpeedChart } from "./trip-speed-chart";
import { TripRouteMap } from "./trip-route-map";
import { TripWithDetails, TripScore, TripEvent } from "@/types/trip";

interface TripDetailViewProps {
  tripId: string;
}

// Mock data generator (without events - those come from API)
function getMockTripData(
  tripId: string,
  events: TripEvent[],
): {
  trip: TripWithDetails;
  score: TripScore;
} {
  const startedAt = new Date("2024-10-24T14:30:00").getTime();
  const duration = 45 * 60 * 1000; // 45 minutes in ms
  const endedAt = startedAt + duration;

  return {
    trip: {
      id: tripId,
      userId: "user-1",
      startedAt,
      endedAt,
      status: "completed",
      totalDistance: 32500, // meters (32.5 km)
      averageSpeed: 18.05, // m/s (~65 km/h)
      createdAt: startedAt,
      updatedAt: endedAt,
      events, // Use real events from API
      locations: generateMockLocations(startedAt, duration),
    },
    score: {
      score: 84,
      rating: "Excellent Driving",
      message: "Top 10% of drivers today. Keep it up!",
    },
  };
}

// Generate mock GPS locations with varying speeds
function generateMockLocations(startedAt: number, duration: number) {
  const locations = [];
  const numPoints = 50;
  const interval = duration / numPoints;

  // Starting coordinates (example: Los Angeles)
  let lat = 34.0522;
  let lon = -118.2437;

  for (let i = 0; i < numPoints; i++) {
    const timestamp = startedAt + i * interval;

    // Simulate movement
    lat += (Math.random() - 0.5) * 0.001;
    lon += (Math.random() - 0.5) * 0.001;

    // Varying speed (between 10-30 m/s, ~36-108 km/h)
    const baseSpeed = 18; // ~65 km/h
    const variation = Math.sin(i / 5) * 8; // Create wave pattern
    const speed = Math.max(
      5,
      baseSpeed + variation + (Math.random() - 0.5) * 3,
    );

    locations.push({
      id: `loc-${i}`,
      tripId: "",
      latitude: lat,
      longitude: lon,
      speed,
      altitude: 100 + Math.random() * 50,
      accuracy: 5 + Math.random() * 10,
      heading: 45 + Math.random() * 20,
      capturedAt: timestamp,
      createdAt: timestamp,
    });
  }

  return locations;
}

export function TripDetailView({ tripId }: TripDetailViewProps) {
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/trips/${tripId}/events`);

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [tripId]);

  // TODO: Replace mock trip data with actual database query
  const { trip, score } = getMockTripData(tripId, events);

  // Format trip date
  const tripDate = new Date(trip.startedAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const tripTime = new Date(trip.startedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = `${tripDate} • ${tripTime}`;

  // Calculate trip duration
  const tripDuration = trip.endedAt! - trip.startedAt;

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-(--background-dark) text-white">
        <div className="text-center">
          <div className="mb-4 text-xl">Loading trip details...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-(--background-dark) text-white">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">Error loading events</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden bg-(--background-dark) text-white">
      {/* Header */}
      <TripHeader tripName="Trip to Downtown" tripDate={formattedDate} />

      {/* Score Card */}
      <TripScoreCard score={score} />

      {/* Stats Cards */}
      <TripStatsCards
        maxSpeed={Math.max(...trip.locations.map((l) => l.speed || 0))}
        averageSpeed={trip.averageSpeed}
        duration={tripDuration}
      />

      {/* Events Summary */}
      <TripEventsSummary events={trip.events} />

      {/* Detected Events List */}
      <TripEventsList events={trip.events} tripStartedAt={trip.startedAt} />

      {/* Speed Over Time Chart */}
      <TripSpeedChart
        locations={trip.locations}
        events={trip.events}
        tripStartedAt={trip.startedAt}
        tripDuration={tripDuration}
      />

      {/* Route Visualization */}
      <TripRouteMap
        locations={trip.locations}
        events={trip.events}
        tripStartedAt={trip.startedAt}
      />
    </div>
  );
}
