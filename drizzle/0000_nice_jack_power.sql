CREATE TABLE `Contact` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`emailId` text NOT NULL,
	`createdDate` text NOT NULL,
	`modifiedDate` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Contact_email_unique` ON `Contact` (`email`);