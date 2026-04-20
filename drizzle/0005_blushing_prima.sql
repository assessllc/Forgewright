CREATE TABLE `comparison_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int,
	`inputText` text NOT NULL,
	`variantALabel` varchar(64) NOT NULL,
	`variantAPrompt` text NOT NULL,
	`variantAOutput` text,
	`variantAModel` varchar(64),
	`variantATokens` int,
	`variantBLabel` varchar(64) NOT NULL,
	`variantBPrompt` text NOT NULL,
	`variantBOutput` text,
	`variantBModel` varchar(64),
	`variantBTokens` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comparison_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comparison_verdicts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comparisonRunId` int NOT NULL,
	`userId` int,
	`preference` enum('a','b','tie','both-bad') NOT NULL,
	`ratingA` int,
	`ratingB` int,
	`reasonTags` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comparison_verdicts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnoses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int,
	`outputText` text NOT NULL,
	`promptText` text,
	`diagnosisJson` json,
	`editAcceptance` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnoses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnosis_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`category` varchar(64) NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`description` text NOT NULL,
	`detectionHeuristics` json,
	`examplePair` json,
	`canonicalRemediation` text NOT NULL,
	`primaryAffectedBlock` varchar(64),
	`linkedPatternSlugs` json,
	`linkedAntiPatternSlugs` json,
	`sourceReference` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnosis_patterns_id` PRIMARY KEY(`id`),
	CONSTRAINT `diagnosis_patterns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `scaffold_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`fullSnapshot` json NOT NULL,
	`createdBy` enum('user','diagnosis','pattern-apply','swarm-sync','discovery','reverse','rollback') NOT NULL,
	`changeSummary` varchar(512) NOT NULL,
	`parentVersionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scaffold_versions_id` PRIMARY KEY(`id`)
);
