CREATE TABLE `runtime_log_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`event_ts` integer NOT NULL,
	`received_at` integer NOT NULL,
	`level` text NOT NULL,
	`runtime` text NOT NULL,
	`runtime_instance_id` text NOT NULL,
	`event_code` text NOT NULL,
	`message` text NOT NULL,
	`search_text` text NOT NULL,
	`payload_json` text,
	`error_json` text,
	`device_id` text NOT NULL,
	`launch_id` text NOT NULL,
	`sync_client_id` text,
	`app_version` text NOT NULL,
	`platform` text NOT NULL,
	`arch` text NOT NULL,
	`is_packaged` integer NOT NULL,
	`auth_state` text NOT NULL,
	`user_id` text,
	`org_id` text,
	`membership_role` text,
	`route` text,
	`repeat_count` integer DEFAULT 1 NOT NULL,
	`ingest_lane` text NOT NULL,
	`raw_ip` text,
	`country_code` text,
	`region` text,
	`city` text,
	`timezone` text,
	`asn` text,
	`network_provider` text
);
--> statement-breakpoint
CREATE INDEX `runtime_log_entries_time_idx` ON `runtime_log_entries` (`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_launch_idx` ON `runtime_log_entries` (`launch_id`,`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_device_idx` ON `runtime_log_entries` (`device_id`,`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_org_idx` ON `runtime_log_entries` (`org_id`,`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_user_idx` ON `runtime_log_entries` (`user_id`,`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_level_idx` ON `runtime_log_entries` (`level`,`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_runtime_idx` ON `runtime_log_entries` (`runtime`,`event_ts`);--> statement-breakpoint
CREATE INDEX `runtime_log_entries_location_idx` ON `runtime_log_entries` (`country_code`,`region`,`city`);--> statement-breakpoint
CREATE TABLE `runtime_log_launches` (
	`launch_id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`app_version` text NOT NULL,
	`platform` text NOT NULL,
	`arch` text NOT NULL,
	`auth_became_available_at` integer,
	`final_user_id` text,
	`final_org_id` text,
	`started_offline` integer,
	`ended_offline` integer,
	`transition_count` integer DEFAULT 0 NOT NULL,
	`offline_duration_ms` integer DEFAULT 0 NOT NULL,
	`online_duration_ms` integer DEFAULT 0 NOT NULL,
	`longest_offline_streak_ms` integer DEFAULT 0 NOT NULL,
	`last_connectivity_change_at` integer,
	`last_known_connectivity_state` text,
	`country_code` text,
	`region` text,
	`city` text,
	`timezone` text,
	`asn` text,
	`network_provider` text,
	`raw_ip` text
);
--> statement-breakpoint
CREATE INDEX `runtime_log_launches_device_idx` ON `runtime_log_launches` (`device_id`,`last_seen_at`);--> statement-breakpoint
CREATE INDEX `runtime_log_launches_user_idx` ON `runtime_log_launches` (`final_user_id`,`last_seen_at`);--> statement-breakpoint
CREATE INDEX `runtime_log_launches_org_idx` ON `runtime_log_launches` (`final_org_id`,`last_seen_at`);--> statement-breakpoint
CREATE TABLE `runtime_log_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_events` (
	`sync_events_id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`operation` text NOT NULL,
	`scope_type` text NOT NULL,
	`scope_id` text NOT NULL,
	`payload_json` text,
	`client_id` text,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sync_events_scope_idx` ON `sync_events` (`scope_type`,`scope_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sync_events_record_idx` ON `sync_events` (`table_name`,`record_id`);--> statement-breakpoint
CREATE TABLE `app_settings` (
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
CREATE UNIQUE INDEX `app_settings_user_uidx` ON `app_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `customers` (
	`customers_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`public_id` text,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email` text,
	`phone` text,
	`document` text,
	`notes` text,
	`company_phone` text,
	`contact_phone` text,
	`contact_name` text,
	`cpf` text,
	`rg` text,
	`address_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `customers_org_status_idx` ON `customers` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `customers_org_name_idx` ON `customers` (`organization_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_public_id_uidx` ON `customers` (`public_id`);--> statement-breakpoint
CREATE TABLE `inbound_order_items` (
	`inbound_order_items_id` text PRIMARY KEY NOT NULL,
	`inbound_order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`variant_json` text,
	`title` text NOT NULL,
	`quantity` integer NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`unit_cost_cents` integer DEFAULT 0 NOT NULL,
	`item_total_cost_cents` integer DEFAULT 0 NOT NULL,
	`product_base_unit_inventory` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`inbound_order_id`) REFERENCES `inbound_order`(`inbound_order_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`products_id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`product_variants_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `inbound_order_items_order_idx` ON `inbound_order_items` (`inbound_order_id`);--> statement-breakpoint
CREATE INDEX `inbound_order_items_product_idx` ON `inbound_order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `inbound_order_payments` (
	`inbound_order_payments_id` text PRIMARY KEY NOT NULL,
	`inbound_order_id` text NOT NULL,
	`method_id` text,
	`method_label` text,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`due_date` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`inbound_order_id`) REFERENCES `inbound_order`(`inbound_order_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inbound_order_payments_order_idx` ON `inbound_order_payments` (`inbound_order_id`);--> statement-breakpoint
CREATE TABLE `inbound_order` (
	`inbound_order_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`supplier_id` text,
	`supplier_json` text,
	`public_id` text,
	`status` text DEFAULT 'request' NOT NULL,
	`order_date` integer NOT NULL,
	`due_date` integer,
	`total_cost_cents` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`suppliers_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `inbound_order_org_status_idx` ON `inbound_order` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `inbound_order_org_supplier_idx` ON `inbound_order` (`organization_id`,`supplier_id`);--> statement-breakpoint
CREATE INDEX `inbound_order_org_created_at_idx` ON `inbound_order` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `inbound_order_public_id_uidx` ON `inbound_order` (`public_id`);--> statement-breakpoint
CREATE TABLE `installment_payments` (
	`installment_payments_id` text PRIMARY KEY NOT NULL,
	`supplier_bill_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`public_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`installment_number` integer DEFAULT 1 NOT NULL,
	`due_date` integer NOT NULL,
	`paid_date` integer,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`paid_amount_cents` integer DEFAULT 0 NOT NULL,
	`payment_method_id` text,
	`payment_method_label` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`supplier_bill_id`) REFERENCES `supplier_bills`(`supplier_bills_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `installment_payments_org_status_idx` ON `installment_payments` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `installment_payments_org_due_date_idx` ON `installment_payments` (`organization_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `installment_payments_bill_idx` ON `installment_payments` (`supplier_bill_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `installment_payments_public_id_uidx` ON `installment_payments` (`public_id`);--> statement-breakpoint
CREATE TABLE `invitation_codes` (
	`invitation_codes_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`used_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_codes_code_uidx` ON `invitation_codes` (`code`);--> statement-breakpoint
CREATE INDEX `invitation_codes_org_idx` ON `invitation_codes` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_codes_expires_at_idx` ON `invitation_codes` (`expires_at`);--> statement-breakpoint
CREATE TABLE `join_requests` (
	`join_requests_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `join_requests_org_status_idx` ON `join_requests` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `join_requests_user_idx` ON `join_requests` (`user_id`);--> statement-breakpoint
CREATE TABLE `onboarding_sessions` (
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
CREATE INDEX `onboarding_sessions_user_status_idx` ON `onboarding_sessions` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_items_id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`variant_json` text,
	`title` text NOT NULL,
	`quantity` integer NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`discount_percent` integer DEFAULT 0 NOT NULL,
	`commission_rate` integer DEFAULT 0 NOT NULL,
	`unit_price_cents` integer DEFAULT 0 NOT NULL,
	`cost_cents` integer DEFAULT 0 NOT NULL,
	`item_total_cost_cents` integer DEFAULT 0 NOT NULL,
	`product_base_unit_inventory` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`orders_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`products_id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`product_variants_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`orders_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`customer_id` text,
	`customer_json` text,
	`public_id` text,
	`status` text DEFAULT 'request' NOT NULL,
	`payment_method_id` text,
	`payment_method_label` text,
	`order_date` integer NOT NULL,
	`due_date` integer,
	`total_commission_cents` integer DEFAULT 0 NOT NULL,
	`total_cost_cents` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customers_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `orders_org_status_idx` ON `orders` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `orders_org_customer_idx` ON `orders` (`organization_id`,`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_org_created_at_idx` ON `orders` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_public_id_uidx` ON `orders` (`public_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`organizations_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`settings_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `organizations_created_by_idx` ON `organizations` (`created_by`);--> statement-breakpoint
CREATE INDEX `organizations_status_idx` ON `organizations` (`status`);--> statement-breakpoint
CREATE INDEX `organizations_created_at_idx` ON `organizations` (`created_at`);--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_categories_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`public_id` text,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_categories_org_status_idx` ON `product_categories` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `product_categories_org_name_idx` ON `product_categories` (`organization_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_public_id_uidx` ON `product_categories` (`public_id`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`product_variants_id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`unit_id` text,
	`label` text NOT NULL,
	`conversion_rate` integer DEFAULT 1 NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`cost_cents` integer DEFAULT 0 NOT NULL,
	`unit_price_cents` integer DEFAULT 0 NOT NULL,
	`profit_cents` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`products_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`units_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `product_variants_product_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_variants_product_default_idx` ON `product_variants` (`product_id`,`is_default`);--> statement-breakpoint
CREATE TABLE `products` (
	`products_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text,
	`supplier_id` text,
	`base_unit_id` text,
	`public_id` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`sku` text,
	`barcode` text,
	`description` text,
	`inventory_base_unit` integer DEFAULT 0 NOT NULL,
	`cost_cents` integer DEFAULT 0 NOT NULL,
	`sailsman_commission_cents` integer DEFAULT 0 NOT NULL,
	`weight` integer DEFAULT 0 NOT NULL,
	`min_inventory` integer,
	`base_unit_json` text,
	`suppliers_json` text,
	`product_category_json` text,
	`variants_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`product_categories_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`suppliers_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`base_unit_id`) REFERENCES `units`(`units_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `products_org_status_idx` ON `products` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `products_org_title_idx` ON `products` (`organization_id`,`title`);--> statement-breakpoint
CREATE INDEX `products_org_category_idx` ON `products` (`organization_id`,`category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_public_id_uidx` ON `products` (`public_id`);--> statement-breakpoint
CREATE TABLE `supplier_bills` (
	`supplier_bills_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`supplier_id` text,
	`supplier_json` text,
	`inbound_order_id` text,
	`inbound_order_json` text,
	`public_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` integer,
	`total_amount_cents` integer DEFAULT 0 NOT NULL,
	`paid_amount_cents` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`suppliers_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`inbound_order_id`) REFERENCES `inbound_order`(`inbound_order_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `supplier_bills_org_status_idx` ON `supplier_bills` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `supplier_bills_org_supplier_idx` ON `supplier_bills` (`organization_id`,`supplier_id`);--> statement-breakpoint
CREATE INDEX `supplier_bills_org_created_at_idx` ON `supplier_bills` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `supplier_bills_public_id_uidx` ON `supplier_bills` (`public_id`);--> statement-breakpoint
CREATE TABLE `supplier_product_categories` (
	`supplier_product_categories_id` text PRIMARY KEY NOT NULL,
	`supplier_id` text NOT NULL,
	`category_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`suppliers_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`product_categories_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `supplier_product_categories_supplier_idx` ON `supplier_product_categories` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `supplier_product_categories_category_idx` ON `supplier_product_categories` (`category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `supplier_product_categories_unique_uidx` ON `supplier_product_categories` (`supplier_id`,`category_id`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`suppliers_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`public_id` text,
	`trade_name` text NOT NULL,
	`legal_name` text,
	`entity_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`email` text,
	`phone` text,
	`document` text,
	`notes` text,
	`company_phone` text,
	`contact_phone` text,
	`contact_name` text,
	`days_to_pay` integer,
	`address_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `suppliers_org_status_idx` ON `suppliers` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `suppliers_org_trade_name_idx` ON `suppliers` (`organization_id`,`trade_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_public_id_uidx` ON `suppliers` (`public_id`);--> statement-breakpoint
CREATE TABLE `units` (
	`units_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`public_id` text,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `units_org_status_idx` ON `units` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `units_org_name_idx` ON `units` (`organization_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `units_public_id_uidx` ON `units` (`public_id`);--> statement-breakpoint
CREATE TABLE `user_memberships` (
	`user_memberships_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`users_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`organizations_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_memberships_user_status_idx` ON `user_memberships` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `user_memberships_org_status_idx` ON `user_memberships` (`organization_id`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`users_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`full_name` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uidx` ON `users` (`email`);