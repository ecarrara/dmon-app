"use client";

import { ArrowLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TripHeaderProps {
  tripName: string;
  tripDate: string;
  onShare?: () => void;
}

export function TripHeader({ tripName, tripDate, onShare }: TripHeaderProps) {
  const router = useRouter();

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // Default share behavior
    if (navigator.share) {
      try {
        await navigator.share({
          title: tripName,
          text: `Check out my trip: ${tripName}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log("Share cancelled", err);
      }
    }
  };

  return (
    <header className="z-20 flex-none border-b border-white/5 bg-(--background-dark)">
      <div className="flex items-center justify-between px-4 pb-4 pt-10">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            {tripName}
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {tripDate}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
