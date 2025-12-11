import { TripEvent } from "@/types/trip";
import { TripEventCard } from "./trip-event-card";

interface TripEventsListProps {
  events: TripEvent[];
  tripStartedAt: number; // Unix timestamp in ms
}

export function TripEventsList({ events, tripStartedAt }: TripEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="px-4 pb-8">
        <h3 className="text-lg font-bold mb-4">Detected Events</h3>
        <div className="bg-[#1a1a1f] rounded-lg p-8 text-center border border-gray-800">
          <p className="text-muted-foreground">
            No events detected during this trip. Great job!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8">
      <h3 className="text-lg font-bold mb-4">Detected Events</h3>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <TripEventCard
            key={event.id}
            event={event}
            tripStartedAt={tripStartedAt}
          />
        ))}
      </div>
    </div>
  );
}
