"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import Map, { Marker, Source, Layer, MapRef } from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { SpeedIndicator } from "./speed-indicator";
import { AIStatusBadge } from "./ai-status-badge";
import { LiveCameraFeed } from "./live-camera-feed";
import { CurrentLocationCard } from "./current-location-card";
import { MapControls } from "./map-controls";
import type { GPSPosition } from "@/hooks/use-gps-tracking";

interface TrackingMapProps {
  currentPosition: GPSPosition | null;
  positionHistory: GPSPosition[];
  speed: number; // km/h
  address: string;
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraActive: boolean;
  cameraError?: string | null;
}

const routeLayerStyle: LayerProps = {
  id: "route",
  type: "line",
  paint: {
    "line-color": "#135bec",
    "line-width": 6,
    "line-opacity": 0.8,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

export function TrackingMap({
  currentPosition,
  positionHistory,
  speed,
  address,
  cameraVideoRef,
  isCameraActive,
  cameraError,
}: TrackingMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  const latitude = currentPosition?.latitude ?? 37.7749;
  const longitude = currentPosition?.longitude ?? -122.4194;

  // Auto-center map when position changes (if user hasn't interacted)
  useEffect(() => {
    if (currentPosition && !userHasInteracted) {
      mapRef.current?.flyTo({
        center: [currentPosition.longitude, currentPosition.latitude],
        duration: 500,
      });
    }
  }, [currentPosition, userHasInteracted]);

  const handleMapInteraction = useCallback(() => {
    setUserHasInteracted(true);
  }, []);

  // Convert position history to GeoJSON line
  const routeGeoJson = useMemo(() => {
    if (positionHistory.length < 2) return null;

    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: positionHistory.map((pos) => [
          pos.longitude,
          pos.latitude,
        ]),
      },
    };
  }, [positionHistory]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleRecenter = useCallback(() => {
    setUserHasInteracted(false);
    if (currentPosition) {
      mapRef.current?.flyTo({
        center: [currentPosition.longitude, currentPosition.latitude],
        zoom: 15,
        duration: 500,
      });
    }
  }, [currentPosition]);

  return (
    <div className="group/map relative w-full flex-1 overflow-hidden bg-(--surface-dark)">
      {/* MapBox Map */}
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          latitude,
          longitude,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={false}
        onDragStart={handleMapInteraction}
        onZoomStart={handleMapInteraction}
      >
        {/* Route line */}
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Current position marker */}
        <Marker latitude={latitude} longitude={longitude} anchor="center">
          <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-(--primary-blue) shadow-lg shadow-(--primary-blue)/50">
            <div className="size-2 animate-pulse rounded-full bg-white" />
          </div>
        </Marker>
      </Map>

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
        {/* Top section */}
        <div className="flex w-full items-start justify-between">
          {/* Left side - Speed and AI status */}
          <div className="flex flex-col gap-3 pt-2">
            <SpeedIndicator speed={speed} />
            <AIStatusBadge isActive={true} />
          </div>

          {/* Right side - Camera feed */}
          <LiveCameraFeed
            videoRef={cameraVideoRef}
            isActive={isCameraActive}
            error={cameraError}
          />
        </div>

        {/* Bottom section */}
        <div className="flex items-end justify-between pb-4">
          {/* Left side - Location card */}
          <CurrentLocationCard address={address} />

          {/* Right side - Map controls */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRecenter={handleRecenter}
          />
        </div>
      </div>
    </div>
  );
}
