import { Video, Satellite, Camera } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface SystemStatusCardProps {
  status?: "ready" | "active" | "offline";
  gpsStatus?: "Strong" | "Weak" | "No Signal";
  cameraStatus?: "Ready" | "Recording" | "Offline";
  location?: string;
}

export function SystemStatusCard({
  status = "ready",
  gpsStatus = "Strong",
  cameraStatus = "Ready",
  location = "Current Location",
}: SystemStatusCardProps) {
  return (
    <div className="px-4 mt-2">
      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-(--surface-dark) shadow-lg">
        {/* Status Badge */}
        <StatusBadge status={status} className="absolute left-3 top-3 z-10" />

        {/* Map Placeholder */}
        <div className="relative h-48 w-full bg-linear-to-br from-slate-800 via-slate-700 to-slate-800">
          {/* Grid pattern overlay to simulate map */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>
          {/* Center marker */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-4 items-center justify-center rounded-full bg-(--primary-blue) shadow-lg shadow-(--primary-blue)/50">
              <div className="size-2 rounded-full bg-white" />
            </div>
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-(--surface-dark) via-transparent to-transparent" />
          {/* Camera icon */}
          <div className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md border border-white/10 bg-black/60 backdrop-blur-md">
            <Video className="size-[18px] text-white" />
          </div>
        </div>

        {/* Location Info */}
        <div className="relative z-10 -mt-12 flex w-full flex-col px-4 py-3">
          <div className="mb-2 flex items-end justify-between">
            <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">
              {location}
            </h3>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-(--surface-highlight)/50 p-2 text-xs text-slate-400 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Satellite className="size-4 text-(--primary-blue)" />
              <span>
                GPS: <span className="font-medium text-white">{gpsStatus}</span>
              </span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Camera className="size-4 text-(--primary-blue)" />
              <span>
                Cam:{" "}
                <span className="font-medium text-white">{cameraStatus}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
