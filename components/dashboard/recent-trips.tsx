import { TripItem } from "./trip-item";

export interface Trip {
  id: string;
  name: string;
  time: string;
  distance: string;
  score: number;
}

interface RecentTripsProps {
  trips: Trip[];
  onViewAll?: () => void;
}

export function RecentTrips({ trips, onViewAll }: RecentTripsProps) {
  return (
    <div className="mb-24 mt-8">
      <div className="flex items-center justify-between px-4 pb-3">
        <h3 className="text-sm font-bold uppercase leading-tight tracking-wider text-white opacity-80">
          Recent Trips
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-(--primary-blue) hover:underline"
        >
          View All
        </button>
      </div>
      <div className="flex flex-col gap-3 px-4">
        {trips.map((trip) => (
          <TripItem
            key={trip.id}
            name={trip.name}
            time={trip.time}
            distance={trip.distance}
            score={trip.score}
          />
        ))}
      </div>
    </div>
  );
}
