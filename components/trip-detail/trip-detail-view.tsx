"use client";

import { useState, useEffect } from "react";
import { TripHeader } from "./trip-header";
import { TripScoreCard } from "./trip-score-card";
import { TripStatsCards } from "./trip-stats-cards";
import { TripEventsList } from "./trip-events-list";
import { TripEventsSummary } from "./trip-events-summary";
import { TripSpeedChart } from "./trip-speed-chart";
import { TripRouteMap } from "./trip-route-map";
import { Trip, TripLocation, TripScore, TripEvent } from "@/types/trip";

interface TripDetailViewProps {
  tripId: string;
}

export function TripDetailView({ tripId }: TripDetailViewProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [locations, setLocations] = useState<TripLocation[]>([]);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trip data, locations, and events from API
  useEffect(() => {
    async function fetchTripData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [tripResponse, locationsResponse, eventsResponse] =
          await Promise.all([
            fetch(`/api/trips/${tripId}`),
            fetch(`/api/trips/${tripId}/locations`),
            fetch(`/api/trips/${tripId}/events`),
          ]);

        if (!tripResponse.ok) {
          throw new Error(`Failed to fetch trip: ${tripResponse.statusText}`);
        }
        if (!locationsResponse.ok) {
          throw new Error(
            `Failed to fetch locations: ${locationsResponse.statusText}`,
          );
        }
        if (!eventsResponse.ok) {
          throw new Error(
            `Failed to fetch events: ${eventsResponse.statusText}`,
          );
        }

        const tripData = await tripResponse.json();
        const locationsData = await locationsResponse.json();
        const eventsData = await eventsResponse.json();

        setTrip(tripData);
        setLocations(locationsData.locations || []);
        setEvents(eventsData.events || []);
      } catch (err) {
        console.error("Error fetching trip data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load trip data",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTripData();
  }, [tripId]);

  // TODO: Replace mock score with actual score calculation
  const score: TripScore = {
    score: 84,
    rating: "Excellent Driving",
    message: "Top 10% of drivers today. Keep it up!",
  };

  // Show loading state
  if (loading || !trip) {
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
          <div className="mb-4 text-xl text-red-500">
            Error loading trip data
          </div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

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
  const tripDuration = trip.endedAt ? trip.endedAt - trip.startedAt : 0;

  return (
    <div className="flex w-full flex-col overflow-hidden bg-(--background-dark) text-white">
      {/* Header */}
      <TripHeader tripName="Trip to Downtown" tripDate={formattedDate} />

      {/* Score Card */}
      <TripScoreCard score={score} />

      {/* Stats Cards */}
      <TripStatsCards
        maxSpeed={Math.max(...locations.map((l) => l.speed || 0), 0)}
        averageSpeed={trip.averageSpeed || 0}
        duration={tripDuration}
      />

      {/* Events Summary */}
      <TripEventsSummary events={events} />

      {/* Detected Events List */}
      <TripEventsList events={events} tripStartedAt={trip.startedAt} />

      {/* Speed Over Time Chart */}
      <TripSpeedChart
        locations={locations}
        events={events}
        tripStartedAt={trip.startedAt}
        tripDuration={tripDuration}
      />

      {/* Route Visualization */}
      <TripRouteMap
        locations={locations}
        events={events}
        tripStartedAt={trip.startedAt}
      />
    </div>
  );
}
