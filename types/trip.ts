// Types based on database schema from lib/db/schema.ts

export type TripStatus = "active" | "completed" | "cancelled";

export type Trip = {
  id: string;
  userId: string;
  startedAt: number; // Unix timestamp in ms
  endedAt: number | null; // Unix timestamp in ms, null if ongoing
  status: TripStatus;
  totalDistance: number | null; // meters
  averageSpeed: number | null; // m/s
  createdAt: number;
  updatedAt: number;
};

export type TripLocation = {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number | null; // m/s from GPS
  altitude: number | null; // meters
  accuracy: number | null; // meters
  heading: number | null; // degrees
  capturedAt: number; // Unix timestamp in ms
  createdAt: number;
};

export type TripEvent = {
  id: string;
  tripId: string;
  eventType: string; // e.g., "Drowsy eye", "Yawn", "phone"
  offset: number; // seconds since trip start
  imageUrl: string | null; // S3 URL to the detection image
  confidence: number | null; // detection confidence score (0-1)
  metadata: string | null; // JSON string for additional data
  createdAt: number; // Unix timestamp in ms
};

// Extended types for UI

export type TripWithDetails = Trip & {
  events: TripEvent[];
  locations: TripLocation[];
};

export type EventSummary = {
  eventType: string;
  count: number;
  icon: string;
  description: string;
};

export type TripScore = {
  score: number; // 0-100
  rating: string; // e.g., "Excellent Driving"
  message: string;
};

// Severity levels for event styling
export type EventSeverity = "critical" | "warning" | "info";

export type EventWithSeverity = TripEvent & {
  severity: EventSeverity;
  color: string;
};
