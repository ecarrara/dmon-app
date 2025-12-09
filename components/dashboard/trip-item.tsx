import { cn } from "@/lib/utils";
import { Clock, ChevronRight } from "lucide-react";

type ScoreGrade = "A" | "B" | "C" | "D" | "F";

interface TripItemProps {
  name: string;
  time: string;
  distance: string;
  score: number;
  className?: string;
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

export function TripItem({
  name,
  time,
  distance,
  score,
  className,
}: TripItemProps) {
  const grade = getGrade(score);
  const colors = gradeColors[grade];

  return (
    <div
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
          <p className="text-base font-bold text-white">{name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {time}
            </span>
            <span className="size-1 rounded-full bg-slate-600" />
            <span>{distance}</span>
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
    </div>
  );
}
