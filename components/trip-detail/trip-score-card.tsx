import { TripScore } from "@/types/trip";

interface TripScoreCardProps {
  score: TripScore;
}

export function TripScoreCard({ score }: TripScoreCardProps) {
  // Calculate circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = score.score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center pt-8 pb-6 px-4">
      {/* Circular Score Indicator */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-4">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-(--primary-blue)/20 blur-xl rounded-full" />

        {/* SVG Progress Circle */}
        <svg
          className="w-full h-full -rotate-90 transform z-10 overflow-visible"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            className="text-muted-foreground/20"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
          />

          {/* Progress circle */}
          <circle
            className="text-(--primary-blue) drop-shadow-[0_0_8px_rgba(19,91,236,0.6)]"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute flex flex-col items-center z-10">
          <h1 className="tracking-tight text-5xl font-bold leading-none">
            {score.score}
          </h1>
          <span className="text-sm font-medium mt-1 text-muted">/ 100</span>
        </div>
      </div>

      {/* Rating and message */}
      <h2 className="text-xl font-bold leading-tight text-center">
        {score.rating}
      </h2>
      <p className="text-sm font-normal leading-normal pt-1 px-4 text-center text-muted">
        {score.message}
      </p>
    </div>
  );
}
