"use client";

import { useState, useEffect } from "react";
import { StatCard } from "./stat-card";

interface TripStats {
  averageScore: number;
  totalMinutes: number;
  totalEvents: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/trips/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching trip stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const score = stats?.averageScore ?? 0;
  const totalMinutes = stats?.totalMinutes ?? 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const events = stats?.totalEvents ?? 0;

  // Calculate progress percentages
  const scoreProgress = score;
  const hoursProgress = Math.min((totalMinutes / 180) * 100, 100); // Assume 3 hours target
  const eventsProgress = events > 0 ? Math.min(events * 20, 100) : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 px-4">
        <StatCard type="score" value="-" subValue="/100" progress={0} />
        <StatCard
          type="hours"
          value={
            <>
              -<span className="text-sm font-medium text-slate-500">h</span> -
              <span className="text-sm font-medium text-slate-500">m</span>
            </>
          }
          progress={0}
        />
        <StatCard type="events" value="-" progress={0} />
      </div>
    );
  }

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
