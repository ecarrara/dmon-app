import { TripEvent, TripScore } from "@/types/trip";

/**
 * Event severity levels with their point penalties
 */
const SEVERITY_PENALTIES = {
  critical: 15, // phone, distracted, asleep, eye closed
  warning: 8, // speed, yawn, drowsy, fatigue
  info: 3, // default
} as const;

/**
 * Determine event severity based on event type
 */
function getEventSeverity(
  eventType: string,
): keyof typeof SEVERITY_PENALTIES {
  const type = eventType.toLowerCase();

  // Critical events (red)
  if (
    type.includes("phone") ||
    type.includes("distract") ||
    type.includes("asleep") ||
    type.includes("eye closed")
  ) {
    return "critical";
  }

  // Warning events (orange)
  if (
    type.includes("speed") ||
    type.includes("yawn") ||
    type.includes("drowsy") ||
    type.includes("fatigue")
  ) {
    return "warning";
  }

  // Default info
  return "info";
}

/**
 * Get rating and message based on score
 */
function getScoreRating(score: number): { rating: string; message: string } {
  if (score >= 90) {
    return {
      rating: "Excellent Driving",
      message: "Top 10% of drivers today. Keep it up!",
    };
  } else if (score >= 80) {
    return {
      rating: "Good Driving",
      message: "You're doing great! A few areas to improve.",
    };
  } else if (score >= 70) {
    return {
      rating: "Average Driving",
      message: "Room for improvement. Stay focused.",
    };
  } else if (score >= 60) {
    return {
      rating: "Below Average",
      message: "Multiple safety concerns detected.",
    };
  } else {
    return {
      rating: "Poor Driving",
      message: "Serious safety issues. Please drive carefully.",
    };
  }
}

/**
 * Calculate trip score based on events and trip duration
 *
 * @param events - Array of trip events
 * @param tripDurationMs - Trip duration in milliseconds
 * @returns TripScore object with score (0-100), rating, and message
 */
export function calculateTripScore(
  events: TripEvent[],
  tripDurationMs: number,
): TripScore {
  const BASE_SCORE = 100;
  const HOUR_IN_MS = 60 * 60 * 1000;

  // Start with perfect score
  let score = BASE_SCORE;

  // Calculate total penalties from events
  let totalPenalty = 0;
  for (const event of events) {
    const severity = getEventSeverity(event.eventType);
    totalPenalty += SEVERITY_PENALTIES[severity];
  }

  // Normalize penalties by trip duration (per hour)
  // Longer trips should have less harsh penalties for the same number of events
  const tripDurationHours = Math.max(tripDurationMs / HOUR_IN_MS, 0.25); // Minimum 15 minutes
  const normalizedPenalty = totalPenalty / tripDurationHours;

  // Apply penalty to score
  score -= normalizedPenalty;

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Get rating and message
  const { rating, message } = getScoreRating(score);

  return {
    score,
    rating,
    message,
  };
}
