DROP INDEX `Contact_email_unique`;--> statement-breakpoint
CREATE INDEX `Contact_email_createdDate_idx` ON `Contact` (`email`,`createdDate`);