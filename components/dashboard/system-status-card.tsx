"use client";

import { Video, Satellite, Camera, Loader2 } from "lucide-react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { StatusBadge } from "./status-badge";
import { useGeolocation } from "@/hooks/use-geolocation";

interface SystemStatusCardProps {
  status?: "ready" | "active" | "offline";
  cameraStatus?: "Ready" | "Recording" | "Offline";
}

export function SystemStatusCard({
  status = "ready",
  cameraStatus = "Ready",
}: SystemStatusCardProps) {
  const { latitude, longitude, loading, error } = useGeolocation();

  const gpsStatus = loading ? "Locating..." : error ? "No Signal" : "Strong";
  const mapLatitude = latitude ?? 37.7749;
  const mapLongitude = longitude ?? -122.4194;

  return (
    <div className="mt-2 px-4">
      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-(--surface-dark) shadow-lg">
        {/* Status Badge */}
        <StatusBadge status={status} className="absolute left-3 top-3 z-10" />

        {/* Map */}
        <div className="relative h-56 w-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-800 via-slate-700 to-slate-800">
              <Loader2 className="size-8 animate-spin text-(--primary-blue)" />
            </div>
          ) : (
            <Map
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              initialViewState={{
                latitude: mapLatitude,
                longitude: mapLongitude,
                zoom: 14,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              interactive={false}
              attributionControl={false}
            >
              {/* Center marker */}
              <Marker
                latitude={mapLatitude}
                longitude={mapLongitude}
                anchor="center"
              >
                <div className="flex size-4 items-center justify-center rounded-full bg-(--primary-blue) shadow-lg shadow-(--primary-blue)/50">
                  <div className="size-2 animate-pulse rounded-full bg-white" />
                </div>
              </Marker>
            </Map>
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--surface-dark) via-transparent to-transparent" />
        </div>

        {/* Location Info */}
        <div className="relative z-10 -mt-12 flex w-full flex-col px-4 py-3">
          <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-(--surface-highlight)/50 p-2 text-xs text-slate-400 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Satellite className="size-4 text-(--primary-blue)" />
              <span>
                GPS:{" "}
                <span
                  className={`font-medium ${error ? "text-yellow-500" : "text-white"}`}
                >
                  {gpsStatus}
                </span>
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
