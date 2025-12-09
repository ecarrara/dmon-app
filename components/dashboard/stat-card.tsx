import { cn } from "@/lib/utils";
import { Shield, Clock, AlertTriangle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatType = "score" | "hours" | "events";

interface StatCardProps {
  type: StatType;
  value: ReactNode;
  subValue?: string;
  progress?: number;
  className?: string;
}

const statConfig: Record<
  StatType,
  { icon: LucideIcon; label: string; iconColor?: string; progressColor: string }
> = {
  score: {
    icon: Shield,
    label: "Score",
    progressColor: "bg-green-500",
  },
  hours: {
    icon: Clock,
    label: "Hours",
    progressColor: "bg-[var(--primary-blue)]",
  },
  events: {
    icon: AlertTriangle,
    label: "Events",
    iconColor: "text-yellow-500",
    progressColor: "bg-slate-500",
  },
};

export function StatCard({
  type,
  value,
  subValue,
  progress = 0,
  className,
}: StatCardProps) {
  const config = statConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-white/5 bg-(--surface-dark) p-3",
        className,
      )}
    >
      <div className="mb-1 flex items-center gap-1 text-slate-400">
        <Icon className={cn("size-[18px]", config.iconColor)} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {config.label}
        </span>
      </div>
      <p className="font-display text-2xl font-bold leading-none text-white">
        {value}
        {subValue && (
          <span className="text-sm font-medium text-slate-500">{subValue}</span>
        )}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={cn("h-full rounded-full", config.progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
