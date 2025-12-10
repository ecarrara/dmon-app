"use client";

import { useState, useCallback } from "react";

interface TripStats {
  totalDistance: number; // meters
  averageSpeed: number; // m/s
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  capturedAt: number;
}

interface UseTripReturn {
  tripId: string | null;
  isCreating: boolean;
  error: string | null;
  createTrip: () => Promise<string | null>;
  endTrip: (tripId: string, stats: TripStats) => Promise<void>;
  sendLocationBatch: (tripId: string, locations: LocationData[]) => Promise<void>;
  uploadVideoClip: (
    tripId: string,
    blob: Blob,
    startTime: number,
    endTime: number
  ) => Promise<void>;
}

export function useTrip(): UseTripReturn {
  const [tripId, setTripId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = useCallback(async (): Promise<string | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startedAt: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create trip: ${response.statusText}`);
      }

      const data = await response.json();
      setTripId(data.id);
      return data.id;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create trip";
      setError(errorMessage);
      console.error("Error creating trip:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const endTrip = useCallback(
    async (tripId: string, stats: TripStats): Promise<void> => {
      try {
        const response = await fetch(`/api/trips/${tripId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            endedAt: Date.now(),
            totalDistance: stats.totalDistance,
            averageSpeed: stats.averageSpeed,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to end trip: ${response.statusText}`);
        }

        setTripId(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to end trip";
        setError(errorMessage);
        console.error("Error ending trip:", err);
      }
    },
    []
  );

  const sendLocationBatch = useCallback(
    async (tripId: string, locations: LocationData[]): Promise<void> => {
      if (locations.length === 0) return;

      try {
        const response = await fetch(`/api/trips/${tripId}/locations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locations,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to send location batch: ${response.statusText}`
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send location batch";
        setError(errorMessage);
        console.error("Error sending location batch:", err);
      }
    },
    []
  );

  const uploadVideoClip = useCallback(
    async (
      tripId: string,
      blob: Blob,
      startTime: number,
      endTime: number
    ): Promise<void> => {
      try {
        const formData = new FormData();
        formData.append("video", blob, "clip.webm");
        formData.append("startTime", startTime.toString());
        formData.append("endTime", endTime.toString());

        const response = await fetch(`/api/trips/${tripId}/clips`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload video clip: ${response.statusText}`);
        }

        console.log("Video clip uploaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload video clip";
        setError(errorMessage);
        console.error("Error uploading video clip:", err);
      }
    },
    []
  );

  return {
    tripId,
    isCreating,
    error,
    createTrip,
    endTrip,
    sendLocationBatch,
    uploadVideoClip,
  };
}
