import { Signal } from "lucide-react";

interface TrackingHeaderProps {
  isRecording?: boolean;
}

export function TrackingHeader({ isRecording = true }: TrackingHeaderProps) {
  return (
    <header className="z-20 flex-none border-b border-white/5 bg-(--background-dark)">
      <div className="flex items-center justify-between px-4 pb-4 pt-10">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <Signal className="size-6 text-white" />
        </div>

        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight">
          Live Tracking
        </h2>

        <div className="flex w-16 items-center justify-end gap-1">
          {isRecording && (
            <>
              <div className="size-2 animate-pulse rounded-full bg-red-500" />
              <p className="shrink-0 text-base font-bold leading-normal tracking-wide text-slate-400">
                REC
              </p>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
