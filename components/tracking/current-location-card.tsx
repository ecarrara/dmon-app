import { MapPin } from "lucide-react";

interface CurrentLocationCardProps {
  address: string;
}

export function CurrentLocationCard({ address }: CurrentLocationCardProps) {
  return (
    <div className="pointer-events-auto max-w-[60%] rounded-xl border border-white/10 bg-(--background-dark)/90 p-3 shadow-lg backdrop-blur-md">
      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        Current Location
      </p>
      <div className="flex items-center gap-1 truncate text-sm font-bold text-white">
        <MapPin className="size-4 shrink-0 text-(--primary-blue)" />
        <span className="truncate">{address}</span>
      </div>
    </div>
  );
}
