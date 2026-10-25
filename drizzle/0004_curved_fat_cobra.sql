CREATE TABLE `echo_publications` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`project_id` text NOT NULL,
	`author_key` text NOT NULL,
	`title` text NOT NULL,
	`author_name` text NOT NULL,
	`author_bio` text NOT NULL,
	`intent` text NOT NULL,
	`format` text NOT NULL,
	`excerpt` text NOT NULL,
	`sources_json` text NOT NULL,
	`content_json` text NOT NULL,
	`published_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `echo_publications_owner_project` ON `echo_publications` (`owner_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `echo_publications_date` ON `echo_publications` (`published_at`);--> statement-breakpoint
CREATE INDEX `echo_publications_author` ON `echo_publications` (`author_key`);