CREATE TABLE `example_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`domain` varchar(64) NOT NULL,
	`taskType` varchar(64) NOT NULL,
	`patternSlug` varchar(64),
	`promptText` text NOT NULL,
	`exampleOutput` text,
	`secondaryPatterns` json,
	`testedModels` json,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
	`tokenCount` int,
	`sourceNote` text,
	`isFeatured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `example_prompts_id` PRIMARY KEY(`id`),
	CONSTRAINT `example_prompts_slug_unique` UNIQUE(`slug`)
);
