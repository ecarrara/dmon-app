import { Gauge } from "lucide-react";

interface SpeedIndicatorProps {
  speed: number;
  unit?: "km/h" | "mph";
}

export function SpeedIndicator({ speed, unit = "km/h" }: SpeedIndicatorProps) {
  return (
    <div className="flex h-10 w-fit shrink-0 items-center justify-center gap-x-3 rounded-lg border border-white/10 bg-(--background-dark)/90 pl-3 pr-4 shadow-lg backdrop-blur-sm">
      <Gauge className="size-6 text-(--primary-blue)" />
      <div>
        <p className="text-lg font-bold leading-none text-white">
          {Math.round(speed)}{" "}
          <span className="text-xs font-normal text-gray-400">{unit}</span>
        </p>
      </div>
    </div>
  );
}
