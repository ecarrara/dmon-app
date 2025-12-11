import { cn } from "@/lib/utils";
import { Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Trip } from "@/types/trip";

type ScoreGrade = "A" | "B" | "C" | "D" | "F";

interface TripItemProps {
  trip: Trip;
  className?: string;
}

function formatTripName(timestamp: number): string {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Morning Trip";
  } else if (hour >= 12 && hour < 17) {
    return "Afternoon Trip";
  } else if (hour >= 17 && hour < 21) {
    return "Evening Trip";
  } else {
    return "Night Trip";
  }
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else {
    return `${days} days ago`;
  }
}

function formatDistance(meters: number | null | undefined): string {
  if (!meters) return "0.0 mi";
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

function getGrade(score: number): ScoreGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const gradeColors: Record<
  ScoreGrade,
  { bg: string; text: string; border: string; hoverBg: string }
> = {
  A: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/20",
    hoverBg: "group-hover:bg-green-500/20",
  },
  B: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    border: "border-yellow-500/20",
    hoverBg: "group-hover:bg-yellow-500/20",
  },
  C: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
    hoverBg: "group-hover:bg-orange-500/20",
  },
  D: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    hoverBg: "group-hover:bg-red-500/20",
  },
  F: {
    bg: "bg-red-700/10",
    text: "text-red-700",
    border: "border-red-700/20",
    hoverBg: "group-hover:bg-red-700/20",
  },
};

export function TripItem({ trip, className }: TripItemProps) {
  const score = trip.score ?? 0;
  const grade = getGrade(score);
  const colors = gradeColors[grade];

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-(--surface-dark) p-4 transition-colors hover:bg-(--surface-highlight)",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-lg border transition-colors",
            colors.bg,
            colors.text,
            colors.border,
            colors.hoverBg,
          )}
        >
          <span className="text-lg font-bold">{grade}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-bold text-white">
            {formatTripName(trip.startedAt)}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatRelativeTime(trip.startedAt)}
            </span>
            <span className="size-1 rounded-full bg-slate-600" />
            <span>{formatDistance(trip.totalDistance)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className={cn("text-sm font-bold", colors.text)}>{score}</span>
          <span className="text-[10px] uppercase text-slate-500">Score</span>
        </div>
        <ChevronRight className="size-5 text-slate-600" />
      </div>
    </Link>
  );
}
