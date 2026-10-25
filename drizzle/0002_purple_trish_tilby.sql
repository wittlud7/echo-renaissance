CREATE TABLE `echo_neo_apps` (
	`origin` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `echo_neo_sessions` (
	`state_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`origin` text NOT NULL,
	`phase` text NOT NULL,
	`token` text,
	`account` text,
	`expires_at` integer NOT NULL
);
