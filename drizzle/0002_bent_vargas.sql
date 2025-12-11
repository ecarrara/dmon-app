CREATE TABLE `trip_event` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`event_type` text NOT NULL,
	`offset` real NOT NULL,
	`image_url` text,
	`confidence` real,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tripEvent_tripId_idx` ON `trip_event` (`trip_id`);--> statement-breakpoint
CREATE INDEX `tripEvent_tripId_offset_idx` ON `trip_event` (`trip_id`,`offset`);