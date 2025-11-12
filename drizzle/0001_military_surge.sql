CREATE TABLE `call_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`vapiCallId` varchar(255) NOT NULL,
	`phoneNumber` varchar(32),
	`startedAt` timestamp NOT NULL,
	`endedAt` timestamp,
	`duration` int,
	`status` varchar(32) NOT NULL,
	`endReason` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `call_sessions_vapiCallId_unique` UNIQUE(`vapiCallId`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`callSessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vapi_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vapiAssistantId` varchar(255),
	`name` varchar(255) NOT NULL,
	`firstMessage` text,
	`systemPrompt` text,
	`voiceProvider` varchar(64),
	`voiceId` varchar(255),
	`model` varchar(64) NOT NULL DEFAULT 'gpt-4',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vapi_agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`callSessionId` int,
	`eventType` varchar(64) NOT NULL,
	`payload` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`)
);
