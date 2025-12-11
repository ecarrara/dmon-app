import { TripHeader } from "./trip-header";
import { TripScoreCard } from "./trip-score-card";
import { TripStatsCards } from "./trip-stats-cards";
import { TripEventsList } from "./trip-events-list";
import { TripEventsSummary } from "./trip-events-summary";
import { TripSpeedChart } from "./trip-speed-chart";
import { TripRouteMap } from "./trip-route-map";
import { TripWithDetails, TripScore } from "@/types/trip";

interface TripDetailViewProps {
  tripId: string;
}

// Mock data generator
function getMockTripData(tripId: string): {
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
      events: [
        {
          id: "event-1",
          tripId,
          eventType: "Distracted Driving",
          offset: 900, // 15 minutes into trip
          imageUrl:
            "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=450&fit=crop",
          confidence: 0.98,
          metadata: JSON.stringify({
            description: "Eyes off road for >3s.",
          }),
          createdAt: startedAt + 900000,
        },
        {
          id: "event-2",
          tripId,
          eventType: "speed",
          offset: 1200, // 20 minutes
          imageUrl:
            "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=450&fit=crop",
          confidence: 0.98,
          metadata: JSON.stringify({
            description: "Eyes off road for >3s.",
          }),
          createdAt: startedAt + 1200000,
        },
        {
          id: "event-3",
          tripId,
          eventType: "Drowsy eye",
          offset: 2100, // 35 minutes
          imageUrl:
            "https://images.unsplash.com/photo-1551410224-699683e15636?w=800&h=450&fit=crop",
          confidence: 0.82,
          metadata: JSON.stringify({
            description: "Eye closure detected.",
          }),
          createdAt: startedAt + 2100000,
        },
      ],
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
  // TODO: Replace with actual database query
  const { trip, score } = getMockTripData(tripId);

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
        startLocation="5th Avenue, NYC"
      />
    </div>
  );
}
