"use client";

import { useCallback, useRef, useState } from "react";
import { TripEvent, EventSeverity } from "@/types/trip";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripEventCardProps {
  event: TripEvent;
  tripStartedAt: number; // Unix timestamp in ms
}

// Helper to determine severity based on event type
function getEventSeverity(eventType: string): EventSeverity {
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

// Get icon based on event type
function getEventIcon(eventType: string) {
  const type = eventType.toLowerCase();

  if (type.includes("phone")) {
    return "📱";
  }
  if (type.includes("speed")) {
    return "⚡";
  }
  if (type.includes("yawn") || type.includes("drowsy")) {
    return "😴";
  }
  if (type.includes("eye")) {
    return "👁️";
  }

  return "⚠️";
}

export function TripEventCard({ event, tripStartedAt }: TripEventCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const severity = getEventSeverity(event.eventType);

  // Calculate event time
  const eventTime = new Date(tripStartedAt + event.offset * 1000);
  const timeStr = eventTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Check if video is available
  const hasVideo = event.videoClip && event.videoClip.status === "processed";
  const videoUrl = event.videoClip?.fileUrl;
  const videoDuration = event.videoClip?.duration || 0;

  // Severity styling
  const severityStyles = {
    critical: {
      border: "border-red-500",
      bg: "bg-red-500/20",
      iconBg: "bg-red-100 dark:bg-red-500/20",
      overlay: "bg-red-500/20",
    },
    warning: {
      border: "border-orange-500",
      bg: "bg-orange-500/20",
      iconBg: "bg-orange-100 dark:bg-orange-500/20",
      overlay: "bg-orange-500/20",
    },
    info: {
      border: "border-blue-500",
      bg: "bg-blue-500/20",
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      overlay: "bg-blue-500/20",
    },
  };

  const style = severityStyles[severity];

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `00:${secs.toString().padStart(2, "0")}`;
  };

  // Get status message for non-processed videos
  const getVideoStatusMessage = () => {
    if (!event.videoClip) return "No video available";
    switch (event.videoClip.status) {
      case "processing":
        return "Video processing...";
      case "failed":
        return "Video unavailable";
      default:
        return null;
    }
  };

  const statusMessage = getVideoStatusMessage();

  const playVideo = useCallback(async () => {
    setIsVideoModalOpen(true);
    videoRef.current!.currentTime = Math.max(event.offset - 5, 0);
  }, [videoRef, event]);

  return (
    <>
      <div
        className={cn(
          "group bg-[#1a1a1f] rounded-lg overflow-hidden shadow-sm",
          hasVideo && "cursor-pointer",
        )}
        onClick={() => hasVideo && playVideo()}
      >
        {/* Video Thumbnail Section */}
        <div
          className={cn(
            "relative w-full aspect-video bg-gray-900 border-b-4",
            style.border,
          )}
        >
          {/* Cover Image */}
          {event.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={`${event.eventType} detection`}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
            />
          )}

          {/* Hover overlay */}
          {hasVideo && (
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                style.overlay,
              )}
            />
          )}

          {/* Play button or status message */}
          <div className="absolute inset-0 flex items-center justify-center">
            {hasVideo ? (
              <div className="bg-(--primary-blue)/90 text-white rounded-full p-3 backdrop-blur-sm shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                <Play className="h-8 w-8 fill-white" />
              </div>
            ) : (
              <div className="bg-black/80 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm">
                {statusMessage}
              </div>
            )}
          </div>

          {/* Duration badge */}
          {hasVideo && videoDuration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md font-medium">
              {formatDuration(videoDuration)}
            </div>
          )}

          {/* Event Details Section */}
          <div className="absolute bottom-0 p-2 flex gap-4">
            {/* Icon */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                style.iconBg,
              )}
            >
              {getEventIcon(event.eventType)}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex flex-col justify-between items-start mb-1">
                <h4 className="font-bold leading-tight">{event.eventType}</h4>
                <span className="text-xs font-mono text-muted">{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {hasVideo && videoUrl && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm",
            isVideoModalOpen ? "visible" : "hidden",
          )}
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <h3 className="text-xl font-bold">{event.eventType}</h3>
                <p className="text-sm text-gray-400">{timeStr}</p>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Close video"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                className="w-full"
                controls
                autoPlay
                ref={videoRef}
                src={videoUrl}
                onError={(e) => {
                  console.error("Error loading video:", e);
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
