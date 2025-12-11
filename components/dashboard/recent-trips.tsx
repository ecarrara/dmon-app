"use client";

import { useState, useEffect } from "react";
import { TripItem } from "./trip-item";
import type { Trip } from "@/types/trip";

interface RecentTripsProps {
  onViewAll?: () => void;
}

export function RecentTrips({ onViewAll }: RecentTripsProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentTrips() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/trips?limit=5");

        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const { trips: apiTrips }: { trips: Trip[] } = await response.json();

        setTrips(apiTrips);
      } catch (err) {
        console.error("Error fetching recent trips:", err);
        setError(err instanceof Error ? err.message : "Failed to load trips");
      } finally {
        setLoading(false);
      }
    }

    fetchRecentTrips();
  }, []);

  if (loading) {
    return (
      <div className="mb-24 mt-8">
        {RecentTripsHeader(onViewAll)}
        <div className="px-4 py-8 text-center text-sm text-white opacity-60">
          Loading trips...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-24 mt-8">
        {RecentTripsHeader(onViewAll)}
        <div className="px-4 py-8 text-center text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="mb-24 mt-8">
        {RecentTripsHeader(onViewAll)}
        <div className="px-4 py-8 text-center text-sm text-white opacity-60">
          No trips yet. Start your first trip!
        </div>
      </div>
    );
  }

  return (
    <div className="mb-24 mt-8">
      {RecentTripsHeader(onViewAll)}
      <div className="flex flex-col gap-3 px-4">
        {trips.map((trip) => (
          <TripItem key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}

function RecentTripsHeader(onViewAll: (() => void) | undefined) {
  return (
    <div className="flex items-center justify-between px-4 pb-3">
      <h3 className="text-sm font-bold uppercase leading-tight tracking-wider text-white opacity-80">
        Recent Trips
      </h3>
      <button
        onClick={onViewAll}
        className="text-xs font-bold text-(--primary-blue) hover:underline"
      >
        View All
      </button>
    </div>
  );
}
