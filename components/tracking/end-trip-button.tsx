"use client";

import { StopCircle, Loader2 } from "lucide-react";

interface EndTripButtonProps {
  onClick?: () => void;
  loading?: boolean;
}

export function EndTripButton({ onClick, loading = false }: EndTripButtonProps) {
  return (
    <footer className="z-20 flex-none border-t border-white/5 bg-(--background-dark) p-4 pb-8">
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">
        <button
          onClick={onClick}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--primary-blue) text-base font-bold tracking-wide text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-600 active:scale-[0.98] active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-(--primary-blue)"
        >
          {loading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              <span>Ending Trip...</span>
            </>
          ) : (
            <>
              <StopCircle className="size-6 fill-current" />
              <span>End Trip</span>
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
