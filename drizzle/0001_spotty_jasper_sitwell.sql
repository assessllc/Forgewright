CREATE TABLE `anti_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`category` varchar(64) NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`description` text NOT NULL,
	`detectionRules` json,
	`detectionHint` text,
	`examples` json,
	`remediation` text NOT NULL,
	`fixedByPatterns` json,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anti_patterns_id` PRIMARY KEY(`id`),
	CONSTRAINT `anti_patterns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `domain_scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`triggerKeywords` json,
	`questions` json,
	`smartDefaults` json,
	`domainPriors` json,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `domain_scripts_id` PRIMARY KEY(`id`),
	CONSTRAINT `domain_scripts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `model_quirks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelId` varchar(64) NOT NULL,
	`modelFamily` varchar(64) NOT NULL,
	`modelDisplayName` varchar(128) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`strengths` json,
	`weaknesses` json,
	`optimizationTips` json,
	`recommendedPatterns` json,
	`avoidPatterns` json,
	`contextWindowTokens` int,
	`pricing` json,
	`knowledgeCutoff` varchar(32),
	`supportsStreaming` boolean DEFAULT true,
	`supportsSystemPrompt` boolean DEFAULT true,
	`supportsJsonMode` boolean DEFAULT false,
	`supportsVision` boolean DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `model_quirks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prompt_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`category` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`whenToUse` text NOT NULL,
	`whenNotToUse` text,
	`taskTypes` json,
	`compatibleModels` json,
	`examples` json,
	`preventsAntiPatterns` json,
	`sourceReference` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prompt_patterns_id` PRIMARY KEY(`id`),
	CONSTRAINT `prompt_patterns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `quick_start_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`title` varchar(128) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`domain` varchar(64),
	`scaffoldBlocks` json,
	`targetModel` varchar(64),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quick_start_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `quick_start_templates_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(256) NOT NULL,
	`description` text,
	`domain` varchar(64),
	`targetModel` varchar(64) DEFAULT 'gpt-4o',
	`specData` json,
	`scaffoldBlocks` json,
	`variants` json,
	`totalTokenCount` int DEFAULT 0,
	`isReverseModeSession` boolean DEFAULT false,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `defaultModel` varchar(64) DEFAULT 'gpt-4o';--> statement-breakpoint
ALTER TABLE `users` ADD `defaultTone` varchar(64) DEFAULT 'professional';--> statement-breakpoint
ALTER TABLE `users` ADD `defaultDomain` varchar(64);