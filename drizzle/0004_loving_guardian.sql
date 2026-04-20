CREATE TABLE `custom_swarms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`goal` text,
	`topology` enum('sequential','parallel','hub-spoke','hierarchical','iterative') NOT NULL DEFAULT 'sequential',
	`agents` json NOT NULL,
	`agentCount` int NOT NULL DEFAULT 0,
	`compatiblePlatforms` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_swarms_id` PRIMARY KEY(`id`)
);
