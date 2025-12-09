import { StatCard } from "./stat-card";

interface StatsGridProps {
  score: number;
  hours: number;
  minutes: number;
  events: number;
}

export function StatsGrid({ score, hours, minutes, events }: StatsGridProps) {
  // Calculate progress percentages
  const scoreProgress = score;
  const hoursProgress = Math.min(((hours * 60 + minutes) / 180) * 100, 100); // Assume 3 hours target
  const eventsProgress = events > 0 ? Math.min(events * 20, 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      <StatCard
        type="score"
        value={score}
        subValue="/100"
        progress={scoreProgress}
      />
      <StatCard
        type="hours"
        value={
          <>
            {hours}
            <span className="text-sm font-medium text-slate-500">h</span>{" "}
            {minutes}
            <span className="text-sm font-medium text-slate-500">m</span>
          </>
        }
        progress={hoursProgress}
      />
      <StatCard type="events" value={events} progress={eventsProgress} />
    </div>
  );
}
