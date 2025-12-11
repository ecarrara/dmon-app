"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import Map, { Marker, Source, Layer, MapRef } from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Plus, Minus } from "lucide-react";

import { TripLocation, TripEvent } from "@/types/trip";

interface TripRouteMapProps {
  locations: TripLocation[];
  events: TripEvent[];
  tripStartedAt: number;
}

const routeLayerStyle: LayerProps = {
  id: "route",
  type: "line",
  paint: {
    "line-color": "#135bec",
    "line-width": 4,
    "line-opacity": 0.8,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

export function TripRouteMap({
  locations,
  events,
  tripStartedAt,
}: TripRouteMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Map events to their locations
  const eventLocations = useMemo(
    () =>
      events.map((event) => {
        // Find location closest to event time
        const eventTime = tripStartedAt + event.offset * 1000;
        const nearestLocation = locations.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.capturedAt - eventTime);
          const currDiff = Math.abs(curr.capturedAt - eventTime);
          return currDiff < prevDiff ? curr : prev;
        });
        return { event, location: nearestLocation };
      }),
    [events, locations, tripStartedAt],
  );

  // Convert locations to GeoJSON line
  const routeGeoJson = useMemo(() => {
    if (locations.length < 2) return null;

    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: locations.map((pos) => [pos.longitude, pos.latitude]),
      },
    };
  }, [locations]);

  // Calculate bounds to fit all locations
  const bounds = useMemo(() => {
    if (locations.length === 0) return null;

    const lngs = locations.map((l) => l.longitude);
    const lats = locations.map((l) => l.latitude);

    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [locations]);

  // Auto-fit bounds when map loads
  useEffect(() => {
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: 40,
          duration: 0,
        },
      );
    }
  }, [bounds]);

  // Determine marker color based on event type
  const getMarkerColor = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes("phone") || type.includes("distract")) {
      return "red";
    }
    if (type.includes("speed")) {
      return "orange";
    }
    return "blue";
  };

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  // Default center if no locations
  const defaultCenter = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  const initialViewState = bounds
    ? {
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        zoom: 13,
      }
    : defaultCenter;

  return (
    <div className="px-4 pb-12">
      <h3 className="mb-4 text-lg font-bold">Route Visualization</h3>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-gray-800 bg-gray-800">
        {locations.length === 0 ? (
          // Show placeholder if no locations
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-900/20 to-green-900/20">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No GPS data available</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mapbox Map */}
            <Map
              ref={mapRef}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              initialViewState={initialViewState}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              attributionControl={false}
            >
              {/* Route line */}
              {routeGeoJson && (
                <Source id="route" type="geojson" data={routeGeoJson}>
                  <Layer {...routeLayerStyle} />
                </Source>
              )}

              {/* Start marker (first location) */}
              {locations[0] && (
                <Marker
                  latitude={locations[0].latitude}
                  longitude={locations[0].longitude}
                  anchor="center"
                >
                  <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg">
                    <div className="size-2 rounded-full bg-white" />
                  </div>
                </Marker>
              )}

              {/* End marker (last location) */}
              {locations[locations.length - 1] && locations.length > 1 && (
                <Marker
                  latitude={locations[locations.length - 1].latitude}
                  longitude={locations[locations.length - 1].longitude}
                  anchor="center"
                >
                  <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-gray-500 shadow-lg">
                    <div className="size-2 rounded-full bg-white" />
                  </div>
                </Marker>
              )}

              {/* Event markers */}
              {eventLocations.map((item) => {
                const color = getMarkerColor(item.event.eventType);
                const markerClass =
                  color === "red"
                    ? "bg-red-500"
                    : color === "orange"
                      ? "bg-orange-500"
                      : "bg-blue-500";

                return (
                  <Marker
                    key={item.event.id}
                    latitude={item.location.latitude}
                    longitude={item.location.longitude}
                    anchor="center"
                  >
                    <div className="group relative flex cursor-pointer flex-col items-center">
                      {/* Pulse animation for critical events */}
                      <div
                        className={`flex size-8 items-center justify-center rounded-full ${markerClass}/30 ${color === "red" ? "animate-pulse" : ""}`}
                      >
                        <div
                          className={`size-3 ${markerClass} rounded-full border-2 border-[#1a1a1f] shadow-lg`}
                        />
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute top-8 whitespace-nowrap rounded border border-white/10 bg-(--background-dark) px-2 py-0.5 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        {item.event.eventType}
                      </div>
                    </div>
                  </Marker>
                );
              })}
            </Map>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-lg shadow-lg">
              <button
                onClick={handleZoomIn}
                className="flex size-10 items-center justify-center bg-(--background-dark)/90 text-white backdrop-blur transition-colors hover:bg-white/10 active:bg-white/20"
                aria-label="Zoom in"
              >
                <Plus className="size-6" />
              </button>
              <div className="h-px w-full bg-white/10" />
              <button
                onClick={handleZoomOut}
                className="flex size-10 items-center justify-center bg-(--background-dark)/90 text-white backdrop-blur transition-colors hover:bg-white/10 active:bg-white/20"
                aria-label="Zoom out"
              >
                <Minus className="size-6" />
              </button>
            </div>

            {/* Gradient overlay at bottom */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--background-dark)/90 via-transparent to-transparent" />
          </>
        )}
      </div>
    </div>
  );
}
