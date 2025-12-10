"use client";

import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";

interface StartTrackingButtonProps {
  onClick?: () => void;
}

export function StartTrackingButton({ onClick }: StartTrackingButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    onClick?.();
    router.push("/tracking");
  };

  return (
    <div className="px-4 py-6">
      <button
        onClick={handleClick}
        className="group relative w-full overflow-hidden rounded-xl bg-(--primary-blue) text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(19,91,236,0.5)]"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-r from-(--primary-blue) via-blue-500 to-(--primary-blue) opacity-100 transition-opacity group-hover:opacity-90" />

        {/* Shimmer effect */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="absolute h-full w-[200%] translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Button content */}
        <div className="relative flex h-16 w-full items-center justify-center gap-3 px-6">
          <PlayCircle className="size-7 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-lg font-bold tracking-wide">
            START TRACKING
          </span>
        </div>
      </button>
      <p className="mt-2 text-center text-xs text-slate-500">
        Tap to begin monitoring your drive
      </p>
    </div>
  );
}
