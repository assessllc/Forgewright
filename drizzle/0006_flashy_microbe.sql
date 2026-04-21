ALTER TABLE `users` ADD `formatHabit` varchar(32) DEFAULT 'markdown';--> statement-breakpoint
ALTER TABLE `users` ADD `encryptedApiKeys` text;--> statement-breakpoint
ALTER TABLE `users` ADD `displayName` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','pro') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(64);