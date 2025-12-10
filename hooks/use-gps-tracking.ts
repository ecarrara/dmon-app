"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GPSPosition {
  latitude: number;
  longitude: number;
  speed: number | null; // m/s from Geolocation API
  timestamp: number;
}

interface GPSTrackingState {
  currentPosition: GPSPosition | null;
  positionHistory: GPSPosition[];
  isTracking: boolean;
  error: string | null;
}

const DEFAULT_POSITION: GPSPosition = {
  latitude: 37.7749,
  longitude: -122.4194,
  speed: null,
  timestamp: Date.now(),
};

export function useGPSTracking() {
  const [state, setState] = useState<GPSTrackingState>({
    currentPosition: null,
    positionHistory: [],
    isTracking: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        currentPosition: DEFAULT_POSITION,
        error: "Geolocation is not supported by this browser",
        isTracking: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };

        setState((prev) => ({
          ...prev,
          currentPosition: newPosition,
          positionHistory: [...prev.positionHistory, newPosition],
          error: null,
        }));
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred";
        }
        setState((prev) => ({
          ...prev,
          currentPosition: DEFAULT_POSITION,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Always get fresh position
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
}
