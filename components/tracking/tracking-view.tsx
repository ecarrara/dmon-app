"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { TrackingShell } from "./tracking-shell";
import { TrackingHeader } from "./tracking-header";
import { TrackingMap } from "./tracking-map";
import { EndTripButton } from "./end-trip-button";
import { useGPSTracking } from "@/hooks/use-gps-tracking";
import { useCamera } from "@/hooks/use-camera";
import { useVideoRecorder } from "@/hooks/use-video-recorder";
import { useTrip } from "@/hooks/use-trip";
import { useRoboflowStream } from "@/hooks/use-roboflow-stream";
import { calculateTripStats } from "@/lib/trip-stats";

// Calculate distance between two coordinates in meters using Haversine formula
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MIN_DISTANCE_FOR_GEOCODE = 10; // meters
const LOCATION_BATCH_INTERVAL = 10000; // 10 seconds

export function TrackingView() {
  const router = useRouter();
  const [address, setAddress] = useState("Locating...");
  const lastGeocodedPosition = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const lastSentLocationIndex = useRef(0);
  const videoChunkStartTime = useRef<number>(Date.now());

  const {
    currentPosition,
    positionHistory,
    isTracking,
    startTracking,
    stopTracking,
  } = useGPSTracking();

  const { stream, error: cameraError, startCamera, stopCamera } = useCamera();

  const { startRecording, stopRecording, isRecording } = useVideoRecorder();

  const { tripId, createTrip, endTrip, sendLocationBatch, uploadVideoClip } =
    useTrip();

  const {
    status: aiStatus,
    connect: connectToRoboflow,
    disconnect: disconnectFromRoboflow,
    remoteStream,
  } = useRoboflowStream({
    onData: (data) => {
      console.log("AI predictions received", data);
    },
    onStatusChange: (status) => {
      console.warn("AI connection status:", status);
    },
    onError: (error) => {
      console.error("AI connection error:", error);
    },
  });

  // Create trip and start tracking on mount
  useEffect(() => {
    const initializeTrip = async () => {
      const id = await createTrip();
      if (id) {
        startTracking();
        startCamera();
      }
    };

    initializeTrip();

    return () => {
      stopTracking();
      stopCamera();
      stopRecording();
      disconnectFromRoboflow();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start video recording when camera stream is ready
  useEffect(() => {
    if (remoteStream && tripId && !isRecording) {
      videoChunkStartTime.current = Date.now();

      const handleVideoChunk = (blob: Blob) => {
        const endTime = Date.now();
        const startTime = videoChunkStartTime.current;

        console.log(`Uploading video chunk: ${startTime} - ${endTime}`);
        uploadVideoClip(tripId, blob, startTime, endTime);

        // Update start time for next chunk
        videoChunkStartTime.current = endTime;
      };

      startRecording(remoteStream, handleVideoChunk);
    }
  }, [remoteStream, tripId, isRecording, startRecording, uploadVideoClip]);

  // Connect to Roboflow AI inference when camera stream is ready
  useEffect(() => {
    if (stream && tripId && aiStatus === "disconnected") {
      connectToRoboflow(stream);
    }
  }, [stream, tripId, aiStatus, connectToRoboflow]);

  // Send location batches every 10 seconds
  useEffect(() => {
    if (!tripId || !isTracking) return;

    const interval = setInterval(() => {
      const newLocations = positionHistory.slice(lastSentLocationIndex.current);

      if (newLocations.length > 0) {
        const locationData = newLocations.map((pos) => ({
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: pos.speed,
          altitude: pos.altitude,
          accuracy: pos.accuracy,
          heading: pos.heading,
          capturedAt: pos.timestamp,
        }));

        sendLocationBatch(tripId, locationData);
        lastSentLocationIndex.current = positionHistory.length;
        console.log(`Sent ${locationData.length} location points`);
      }
    }, LOCATION_BATCH_INTERVAL);

    return () => clearInterval(interval);
  }, [tripId, isTracking, positionHistory, sendLocationBatch]);

  // Reverse geocode to get address (only if moved more than 10 meters)
  useEffect(() => {
    if (!currentPosition) return;

    // Check if we need to fetch a new address
    const lastPos = lastGeocodedPosition.current;
    if (lastPos) {
      const distance = getDistanceInMeters(
        lastPos.latitude,
        lastPos.longitude,
        currentPosition.latitude,
        currentPosition.longitude,
      );
      if (distance < MIN_DISTANCE_FOR_GEOCODE) {
        return; // Skip geocoding if moved less than 10 meters
      }
    }

    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${currentPosition.longitude},${currentPosition.latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1`,
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          setAddress(data.features[0].place_name);
          lastGeocodedPosition.current = {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
          };
        }
      } catch {
        setAddress("Address unavailable");
      }
    };

    fetchAddress();
  }, [currentPosition]);

  // Convert speed from m/s to km/h
  const speedKmh = currentPosition?.speed
    ? Math.round(currentPosition.speed * 3.6)
    : 0;

  const handleEndTrip = async () => {
    if (!tripId) {
      router.push("/");
      return;
    }

    // Stop tracking and recording
    stopTracking();
    stopCamera();
    stopRecording();
    disconnectFromRoboflow();

    // Calculate trip statistics
    const stats = calculateTripStats(positionHistory);

    // Send remaining location batch
    const remainingLocations = positionHistory.slice(
      lastSentLocationIndex.current,
    );
    if (remainingLocations.length > 0) {
      const locationData = remainingLocations.map((pos) => ({
        latitude: pos.latitude,
        longitude: pos.longitude,
        speed: pos.speed,
        altitude: pos.altitude,
        accuracy: pos.accuracy,
        heading: pos.heading,
        capturedAt: pos.timestamp,
      }));
      await sendLocationBatch(tripId, locationData);
    }

    // End trip with statistics
    await endTrip(tripId, stats);

    // Navigate to home
    router.push("/");
  };

  return (
    <TrackingShell>
      <TrackingHeader isRecording={isTracking} />
      <TrackingMap
        currentPosition={currentPosition}
        positionHistory={positionHistory}
        speed={speedKmh}
        address={address}
        cameraStream={remoteStream}
        isCameraActive={aiStatus === "connected"}
        cameraError={
          aiStatus === "error" ? "AI connection failed" : cameraError
        }
      />
      <EndTripButton onClick={handleEndTrip} />
    </TrackingShell>
  );
}
