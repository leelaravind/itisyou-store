CREATE TABLE `analytics_events` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`productId` int,
	`path` varchar(512),
	`referrer` varchar(512),
	`sessionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int,
	`buyerEmail` varchar(320),
	`externalOrderId` varchar(256),
	`amount` decimal(10,2),
	`currency` varchar(8) NOT NULL DEFAULT 'GBP',
	`status` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text,
	`altText` varchar(256),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(256) NOT NULL,
	`tagline` varchar(512),
	`shortDescription` text,
	`description` text,
	`features` text,
	`useCases` text,
	`systemRequirements` text,
	`version` varchar(64),
	`platform` varchar(128),
	`categoryId` int,
	`status` enum('available','coming_soon','hidden') NOT NULL DEFAULT 'available',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`iconUrl` text,
	`externalCheckoutUrl` text,
	`supportUrl` text,
	`documentationUrl` text,
	`refundPolicy` text,
	`privacyInfo` text,
	`metaTitle` varchar(256),
	`metaDescription` text,
	`ogImage` text,
	`currency` varchar(8) NOT NULL DEFAULT 'GBP',
	`basePrice` decimal(10,2),
	`discountType` enum('none','percentage','fixed') NOT NULL DEFAULT 'none',
	`discountValue` decimal(10,2),
	`discountExpiresAt` timestamp,
	`viewCount` bigint NOT NULL DEFAULT 0,
	`buyClickCount` bigint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int,
	`reviewerName` varchar(128),
	`reviewerEmail` varchar(320),
	`rating` int NOT NULL,
	`title` varchar(256),
	`body` text,
	`status` enum('pending','approved','rejected','hidden') NOT NULL DEFAULT 'pending',
	`adminReply` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
