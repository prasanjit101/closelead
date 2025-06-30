CREATE TABLE `agent` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`description` text,
	`system_prompt` text NOT NULL,
	`type` text NOT NULL,
	`links` text,
	`metadata` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agent_webhooks` (
	`agent_id` text NOT NULL,
	`webhook_id` text NOT NULL,
	PRIMARY KEY(`agent_id`, `webhook_id`),
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'disconnected' NOT NULL,
	`connection_id` text,
	`entity_id` text,
	`metadata` text,
	`last_sync_at` integer,
	`error_message` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `email_templates`;--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "created_at" TO "created_at" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `webhooks` ALTER COLUMN "created_at" TO "created_at" integer;--> statement-breakpoint
ALTER TABLE `webhooks` ADD `webhook_secret` text;--> statement-breakpoint
ALTER TABLE `webhooks` ADD `scoring_prompt` text;--> statement-breakpoint
ALTER TABLE `webhooks` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `leads` ALTER COLUMN "created_at" TO "created_at" integer;--> statement-breakpoint
ALTER TABLE `leads` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `leads` ADD `score_breakdown` text;--> statement-breakpoint
ALTER TABLE `leads` DROP COLUMN `phone`;--> statement-breakpoint
ALTER TABLE `leads` DROP COLUMN `company`;