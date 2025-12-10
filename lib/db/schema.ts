import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ============================================
// Trip Tracking Tables
// ============================================

export const trip = sqliteTable(
  "trip",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startedAt: integer("started_at").notNull(), // Unix timestamp in ms
    endedAt: integer("ended_at"), // Unix timestamp in ms, null if ongoing
    status: text("status", { enum: ["active", "completed", "cancelled"] })
      .notNull()
      .default("active"),
    totalDistance: real("total_distance"), // meters
    averageSpeed: real("average_speed"), // m/s
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("trip_userId_idx").on(table.userId),
    index("trip_userId_status_idx").on(table.userId, table.status),
  ],
);

export const tripLocation = sqliteTable(
  "trip_location",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    speed: real("speed"), // m/s from GPS
    altitude: real("altitude"), // meters
    accuracy: real("accuracy"), // meters
    heading: real("heading"), // degrees
    capturedAt: integer("captured_at").notNull(), // Unix timestamp in ms
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("tripLocation_tripId_idx").on(table.tripId)],
);

export const tripVideoClip = sqliteTable(
  "trip_video_clip",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),
    startTime: integer("start_time").notNull(), // Unix timestamp in ms
    endTime: integer("end_time").notNull(), // Unix timestamp in ms
    duration: integer("duration").notNull(), // seconds
    fileUrl: text("file_url"), // S3 URL
    fileSize: integer("file_size"), // bytes
    status: text("status", {
      enum: ["uploading", "processing", "processed", "failed"],
    })
      .notNull()
      .default("uploading"),
    processedAt: integer("processed_at"), // Unix timestamp in ms
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("tripVideoClip_tripId_idx").on(table.tripId)],
);
