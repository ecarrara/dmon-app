"use client";

import { StopCircle } from "lucide-react";

interface EndTripButtonProps {
  onClick?: () => void;
}

export function EndTripButton({ onClick }: EndTripButtonProps) {
  return (
    <footer className="z-20 flex-none border-t border-white/5 bg-(--background-dark) p-4 pb-8">
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">
        <button
          onClick={onClick}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--primary-blue) text-base font-bold tracking-wide text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-600 active:scale-[0.98] active:bg-blue-700"
        >
          <StopCircle className="size-6 fill-current" />
          <span>End Trip</span>
        </button>
      </div>
    </footer>
  );
}
