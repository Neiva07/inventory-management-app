PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_app_settings` (
	`app_settings_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text,
	`settings_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_app_settings`("app_settings_id", "user_id", "organization_id", "settings_json", "created_at", "updated_at") SELECT "app_settings_id", "user_id", "organization_id", "settings_json", "created_at", "updated_at" FROM `app_settings`;--> statement-breakpoint
DROP TABLE `app_settings`;--> statement-breakpoint
ALTER TABLE `__new_app_settings` RENAME TO `app_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_user_uidx` ON `app_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_onboarding_sessions` (
	`onboarding_sessions_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`payload_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_onboarding_sessions`("onboarding_sessions_id", "user_id", "organization_id", "status", "step", "payload_json", "created_at", "updated_at") SELECT "onboarding_sessions_id", "user_id", "organization_id", "status", "step", "payload_json", "created_at", "updated_at" FROM `onboarding_sessions`;--> statement-breakpoint
DROP TABLE `onboarding_sessions`;--> statement-breakpoint
ALTER TABLE `__new_onboarding_sessions` RENAME TO `onboarding_sessions`;--> statement-breakpoint
CREATE INDEX `onboarding_sessions_user_status_idx` ON `onboarding_sessions` (`user_id`,`status`);--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `inbound_order_items` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `inbound_order_payments` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `inbound_order` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `installment_payments` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `invitation_codes` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `join_requests` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `order_items` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `organizations` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `product_categories` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `product_variants` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `supplier_bills` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `supplier_product_categories` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `suppliers` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `sync_queue` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `units` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `user_memberships` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `deleted_at`;