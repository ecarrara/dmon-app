import { TripEvent, EventSummary } from "@/types/trip";
import { EyeOff, Smartphone, AlertTriangle, Activity } from "lucide-react";

interface TripEventsSummaryProps {
  events: TripEvent[];
}

// Helper to group events by category
function categorizeEvents(events: TripEvent[]): EventSummary[] {
  const categories: Record<string, EventSummary> = {};

  events.forEach((event) => {
    const type = event.eventType.toLowerCase();

    // Drowsiness/Fatigue category
    if (
      type.includes("drowsy") ||
      type.includes("yawn") ||
      type.includes("asleep") ||
      type.includes("eye closed") ||
      type.includes("fatigue")
    ) {
      if (!categories.drowsiness) {
        categories.drowsiness = {
          eventType: "Drowsiness",
          count: 0,
          icon: "EyeOff",
          description: "Eyeclosed, Yawning, Asleep",
        };
      }
      categories.drowsiness.count++;
    }
    // Phone usage category
    else if (type.includes("phone") || type.includes("distract")) {
      if (!categories.phone) {
        categories.phone = {
          eventType: "Phone Usage",
          count: 0,
          icon: "Smartphone",
          description: "Distraction detected",
        };
      }
      categories.phone.count++;
    }
    // Speeding category
    else if (type.includes("speed")) {
      if (!categories.speeding) {
        categories.speeding = {
          eventType: "Speeding",
          count: 0,
          icon: "Activity",
          description: "Speed limit exceeded",
        };
      }
      categories.speeding.count++;
    }
    // Other category
    else {
      if (!categories.other) {
        categories.other = {
          eventType: "Other Events",
          count: 0,
          icon: "AlertTriangle",
          description: "Various detections",
        };
      }
      categories.other.count++;
    }
  });

  return Object.values(categories);
}

export function TripEventsSummary({ events }: TripEventsSummaryProps) {
  const summary = categorizeEvents(events);

  if (summary.length === 0) {
    return null;
  }

  const getIcon = (iconName: string) => {
    const iconProps = { className: "text-red-500 w-12 h-12" };

    switch (iconName) {
      case "EyeOff":
        return <EyeOff {...iconProps} />;
      case "Smartphone":
        return <Smartphone {...iconProps} />;
      case "Activity":
        return <Activity {...iconProps} />;
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  return (
    <div className="px-4 pb-8">
      <h3 className="text-lg font-bold mb-4">Detected Events Summary</h3>
      <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory">
        {summary.map((category) => (
          <div
            key={category.eventType}
            className="flex flex-col min-w-36 snap-center snap-always items-center justify-center gap-2 rounded-lg p-4 bg-[#1a1a1f] border border-gray-800 shadow-sm text-center"
          >
            {getIcon(category.icon)}
            <p className="font-bold text-2xl leading-none">{category.count}</p>
            <p className="font-medium text-sm">{category.eventType}</p>
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
