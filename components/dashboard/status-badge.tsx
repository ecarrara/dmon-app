import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "ready" | "active" | "offline";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    ready: {
      label: "System Ready",
      dotColor: "bg-green-500",
    },
    active: {
      label: "Tracking Active",
      dotColor: "bg-blue-500",
    },
    offline: {
      label: "Offline",
      dotColor: "bg-slate-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-white/10 bg-black/60 px-2 py-1 backdrop-blur-md",
        className,
      )}
    >
      <span
        className={cn(
          "block size-2 rounded-full animate-pulse",
          config.dotColor,
        )}
      />
      <span className="text-[10px] font-bold uppercase tracking-wider text-white">
        {config.label}
      </span>
    </div>
  );
}
