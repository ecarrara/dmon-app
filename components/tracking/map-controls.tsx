"use client";

import { Plus, Minus, Navigation2 } from "lucide-react";

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
}: MapControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
        <button
          onClick={onZoomIn}
          className="flex size-10 items-center justify-center bg-(--background-dark)/90 text-white backdrop-blur transition-colors hover:bg-white/10 active:bg-white/20"
          aria-label="Zoom in"
        >
          <Plus className="size-6" />
        </button>
        <div className="h-px w-full bg-white/10" />
        <button
          onClick={onZoomOut}
          className="flex size-10 items-center justify-center bg-(--background-dark)/90 text-white backdrop-blur transition-colors hover:bg-white/10 active:bg-white/20"
          aria-label="Zoom out"
        >
          <Minus className="size-6" />
        </button>
      </div>

      {/* Recenter button */}
      <button
        onClick={onRecenter}
        className="flex size-10 items-center justify-center rounded-lg bg-(--background-dark)/90 text-(--primary-blue) shadow-lg backdrop-blur transition-colors hover:bg-white/10"
        aria-label="Recenter map"
      >
        <Navigation2 className="size-6" />
      </button>
    </div>
  );
}
