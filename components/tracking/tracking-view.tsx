"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Calculate distance between two coordinates in meters using Haversine formula
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
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

import { TrackingShell } from "./tracking-shell";
import { TrackingHeader } from "./tracking-header";
import { TrackingMap } from "./tracking-map";
import { EndTripButton } from "./end-trip-button";
import { useGPSTracking } from "@/hooks/use-gps-tracking";
import { useCamera } from "@/hooks/use-camera";

const MIN_DISTANCE_FOR_GEOCODE = 50; // meters

export function TrackingView() {
  const router = useRouter();
  const [address, setAddress] = useState("Locating...");
  const lastGeocodedPosition = useRef<{ latitude: number; longitude: number } | null>(null);

  const {
    currentPosition,
    positionHistory,
    isTracking,
    startTracking,
    stopTracking,
  } = useGPSTracking();

  const {
    isActive: isCameraActive,
    error: cameraError,
    videoRef,
    startCamera,
    stopCamera,
  } = useCamera();

  // Start tracking and camera on mount
  useEffect(() => {
    startTracking();
    startCamera();

    return () => {
      stopTracking();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        currentPosition.longitude
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

  const handleEndTrip = () => {
    stopTracking();
    stopCamera();
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
        cameraVideoRef={videoRef}
        isCameraActive={isCameraActive}
        cameraError={cameraError}
      />
      <EndTripButton onClick={handleEndTrip} />
    </TrackingShell>
  );
}
