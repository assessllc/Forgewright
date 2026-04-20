CREATE TABLE `swarm_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`useCase` text NOT NULL,
	`topology` enum('sequential','parallel','hub-spoke','hierarchical','iterative') NOT NULL,
	`agents` json NOT NULL,
	`compatiblePlatforms` json,
	`domains` json,
	`agentCount` int NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
	`isFeatured` boolean DEFAULT false,
	`sourceNote` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `swarm_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `swarm_templates_slug_unique` UNIQUE(`slug`)
);
