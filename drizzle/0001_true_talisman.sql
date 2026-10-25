CREATE TABLE `echo_vault_chunks` (
	`user_id` text NOT NULL,
	`upload_id` text NOT NULL,
	`part` integer NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`user_id`, `upload_id`, `part`)
);
