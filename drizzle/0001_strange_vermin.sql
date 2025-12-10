CREATE TABLE `trip` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`total_distance` real,
	`average_speed` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trip_userId_idx` ON `trip` (`user_id`);--> statement-breakpoint
CREATE INDEX `trip_userId_status_idx` ON `trip` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `trip_location` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`speed` real,
	`altitude` real,
	`accuracy` real,
	`heading` real,
	`captured_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tripLocation_tripId_idx` ON `trip_location` (`trip_id`);--> statement-breakpoint
CREATE TABLE `trip_video_clip` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`duration` integer NOT NULL,
	`file_url` text,
	`file_size` integer,
	`status` text DEFAULT 'uploading' NOT NULL,
	`processed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tripVideoClip_tripId_idx` ON `trip_video_clip` (`trip_id`);