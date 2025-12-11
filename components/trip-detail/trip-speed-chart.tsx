"use client";
import { TripLocation, TripEvent } from "@/types/trip";

interface TripSpeedChartProps {
  locations: TripLocation[];
  events: TripEvent[];
  tripStartedAt: number;
  tripDuration: number; // milliseconds
}

// Helper to generate SVG path from speed data
function generateSpeedPath(
  locations: TripLocation[],
  width: number,
  height: number,
  maxSpeed: number,
): string {
  if (locations.length === 0) return "";

  const points = locations
    .filter((loc) => loc.speed !== null)
    .map((loc, index) => {
      const x = (index / (locations.length - 1)) * width;
      // Convert speed (m/s) to km/h for display
      const speedKmh = (loc.speed || 0) * 3.6;
      // Invert Y axis (0 is at top in SVG)
      const y = height - (speedKmh / maxSpeed) * height;
      return { x, y };
    });

  if (points.length === 0) return "";

  // Create smooth curve using cubic Bezier
  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    const controlPointX = (prevPoint.x + currentPoint.x) / 2;

    path += ` C${controlPointX},${prevPoint.y} ${controlPointX},${currentPoint.y} ${currentPoint.x},${currentPoint.y}`;
  }

  return path;
}

export function TripSpeedChart({
  locations,
  events,
  tripStartedAt,
  tripDuration,
}: TripSpeedChartProps) {
  const width = 400;
  const height = 150;

  // Find max speed for scaling (in km/h)
  const maxSpeedKmh = Math.max(
    120,
    ...locations.map((loc) => (loc.speed || 0) * 3.6),
  );

  // Generate path
  const speedPath = generateSpeedPath(locations, width, height, maxSpeedKmh);

  // Create filled area path
  const filledPath = speedPath
    ? `${speedPath} L${width},${height} L0,${height} Z`
    : "";

  // Map events to chart positions
  const eventMarkers = events
    .filter((e) => e.eventType.toLowerCase().includes("speed"))
    .map((event) => {
      const offsetRatio = (event.offset * 1000) / tripDuration;
      const x = offsetRatio * width;
      // Find nearest location to get speed at that time
      const nearestLoc = locations.reduce((prev, curr) => {
        const prevDiff = Math.abs(
          prev.capturedAt - (tripStartedAt + event.offset * 1000),
        );
        const currDiff = Math.abs(
          curr.capturedAt - (tripStartedAt + event.offset * 1000),
        );
        return currDiff < prevDiff ? curr : prev;
      });
      const speedKmh = (nearestLoc.speed || 0) * 3.6;
      const y = height - (speedKmh / maxSpeedKmh) * height;
      return { x, y, event };
    });

  // Format duration for x-axis labels
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  };

  const timeLabels = [
    { label: "0m", position: 0 },
    { label: formatTime(tripDuration / 3), position: 33 },
    { label: formatTime((tripDuration * 2) / 3), position: 67 },
    { label: formatTime(tripDuration), position: 100 },
  ];

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Speed Over Time</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-(--primary-blue)" />
          <span className="text-xs text-muted-foreground font-medium">
            Speed (km/h)
          </span>
        </div>
      </div>

      <div className="w-full bg-[#1a1a1f] rounded-lg p-4 border border-gray-800 relative h-48">
        <div className="w-full h-full relative">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            {/* Y-axis labels */}
            {[0, 30, 60, 90, 120].map((value, index) => {
              const y = height - (value / maxSpeedKmh) * height;
              return (
                <g key={index}>
                  <text
                    className="text-xs fill-current"
                    fill="rgb(100, 116, 139)"
                    x="-5"
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {value}
                  </text>
                  <line
                    stroke="rgb(55, 65, 81)"
                    x1="0"
                    y1={y}
                    x2={width}
                    y2={y}
                    strokeWidth="1"
                    strokeDasharray={index === 0 ? "0" : "2 2"}
                  />
                </g>
              );
            })}

            {/* Gradient fill definition */}
            <defs>
              <linearGradient id="speedGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#135bec" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#135bec" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Filled area */}
            {filledPath && <path d={filledPath} fill="url(#speedGradient)" />}

            {/* Speed line */}
            {speedPath && (
              <path
                d={speedPath}
                fill="none"
                stroke="#135bec"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(19,91,236,0.6)]"
              />
            )}

            {/* Event markers */}
            {eventMarkers.map((marker, index) => (
              <circle
                key={index}
                cx={marker.x}
                cy={marker.y}
                r="5"
                className="fill-red-500 stroke-2 stroke-background"
              />
            ))}
          </svg>
        </div>

        {/* X-axis time labels */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
          {timeLabels.map((time, index) => (
            <span key={index}>{time.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
