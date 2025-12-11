"use client";

import { TripLocation, TripEvent } from "@/types/trip";

interface TripRouteMapProps {
  locations: TripLocation[];
  events: TripEvent[];
  tripStartedAt: number;
}

export function TripRouteMap({
  locations,
  events,
  tripStartedAt,
}: TripRouteMapProps) {
  // Map events to their locations
  const eventLocations = events.map((event) => {
    // Find location closest to event time
    const eventTime = tripStartedAt + event.offset * 1000;
    const nearestLocation = locations.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.capturedAt - eventTime);
      const currDiff = Math.abs(curr.capturedAt - eventTime);
      return currDiff < prevDiff ? curr : prev;
    });
    return { event, location: nearestLocation };
  });

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

  return (
    <div className="px-4 pb-12">
      <h3 className="text-lg font-bold mb-4">Route Visualization</h3>
      <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden bg-gray-800 border border-gray-800">
        {/* Map placeholder - will be replaced with actual map integration */}
        <div className="w-full h-full bg-linear-to-br from-blue-900/20 to-green-900/20 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Map Integration Placeholder</p>
            <p className="text-xs mt-1">
              {locations.length} GPS points recorded
            </p>
          </div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-(--background-dark)/90 via-transparent to-transparent pointer-events-none" />

        {/* Event markers - positioned based on percentage */}
        {eventLocations.map((item, index) => {
          const color = getMarkerColor(item.event.eventType);
          const markerClass =
            color === "red"
              ? "bg-red-500"
              : color === "orange"
                ? "bg-orange-500"
                : "bg-blue-500";

          // Mock positioning - in real implementation, convert GPS to map coordinates
          const left = 30 + ((index * 35) % 40);
          const top = 40 + ((index * 20) % 20);

          return (
            <div
              key={item.event.id}
              className="absolute flex flex-col items-center group cursor-pointer"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {/* Pulse animation for critical events */}
              <div
                className={`w-8 h-8 rounded-full ${markerClass}/30 flex items-center justify-center ${color === "red" ? "animate-pulse" : ""}`}
              >
                <div
                  className={`w-3 h-3 ${markerClass} rounded-full border-2 border-[#1a1a1f] shadow-lg`}
                />
              </div>
              {/* Tooltip on hover */}
              <div className="bg-(--background-dark) text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute top-8 whitespace-nowrap shadow-lg border border-white/10">
                {item.event.eventType}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
