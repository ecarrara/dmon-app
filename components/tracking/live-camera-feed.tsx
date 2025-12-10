"use client";

import { RefObject } from "react";
import { Camera, VideoOff } from "lucide-react";

interface LiveCameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error?: string | null;
}

export function LiveCameraFeed({
  videoRef,
  isActive,
  error,
}: LiveCameraFeedProps) {
  return (
    <div className="group/pip relative aspect-3/4 w-32 cursor-pointer overflow-hidden rounded-xl border-2 border-white/10 bg-black shadow-2xl transition-transform active:scale-95">
      {error ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-800 p-2">
          <VideoOff className="size-8 text-slate-500" />
          <p className="text-center text-[10px] text-slate-400">{error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center gap-1">
          {isActive && <div className="size-1.5 rounded-full bg-green-500" />}
          <span className="text-[10px] font-bold tracking-wider text-white">
            LIVE CAM
          </span>
        </div>
      </div>

      {/* Expand icon on hover */}
      <div className="absolute right-1 top-1 rounded bg-black/50 p-0.5 opacity-0 transition-opacity group-hover/pip:opacity-100">
        <Camera className="size-4 text-white" />
      </div>
    </div>
  );
}
