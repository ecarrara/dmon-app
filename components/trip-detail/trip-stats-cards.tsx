import { Gauge, TrendingUp, Timer } from "lucide-react";

interface TripStatsCardsProps {
  maxSpeed: number | null; // m/s
  averageSpeed: number | null; // m/s
  duration: number; // milliseconds
}

export function TripStatsCards({
  maxSpeed,
  averageSpeed,
  duration,
}: TripStatsCardsProps) {
  // Convert m/s to km/h
  const maxSpeedKmh = maxSpeed ? Math.round(maxSpeed * 3.6 * 10) / 10 : 0;
  const avgSpeedKmh = averageSpeed
    ? Math.round(averageSpeed * 3.6 * 10) / 10
    : 0;

  // Convert duration to human readable format
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const durationText = formatDuration(duration);

  return (
    <div className="flex gap-3 px-4 pb-6 overflow-x-auto no-scrollbar">
      {/* Max Speed Card */}
      <div className="flex min-w-[110px] flex-1 flex-col gap-1 rounded-lg p-4 bg-[#1a1a1f] border border-gray-800 shadow-sm">
        <Gauge className="text-(--primary-blue) h-5 w-5 mb-1" />
        <p className="text-xs font-medium leading-normal uppercase tracking-wider text-muted-foreground">
          Max Speed
        </p>
        <p className="tracking-tight text-xl font-bold leading-tight">
          {maxSpeedKmh}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            km/h
          </span>
        </p>
      </div>

      {/* Average Speed Card */}
      <div className="flex min-w-[110px] flex-1 flex-col gap-1 rounded-lg p-4 bg-[#1a1a1f] border border-gray-800 shadow-sm">
        <TrendingUp className="text-(--primary-blue) h-5 w-5 mb-1" />
        <p className="text-xs font-medium leading-normal uppercase tracking-wider text-muted-foreground">
          Avg Speed
        </p>
        <p className="tracking-tight text-xl font-bold leading-tight">
          {avgSpeedKmh}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            km/h
          </span>
        </p>
      </div>

      {/* Duration Card */}
      <div className="flex min-w-[110px] flex-1 flex-col gap-1 rounded-lg p-4 bg-[#1a1a1f] border border-gray-800 shadow-sm">
        <Timer className="text-(--primary-blue) h-5 w-5 mb-1" />
        <p className="text-xs font-medium leading-normal uppercase tracking-wider text-muted-foreground">
          Duration
        </p>
        <p className="tracking-tight text-xl font-bold leading-tight">
          {durationText}
        </p>
      </div>
    </div>
  );
}
