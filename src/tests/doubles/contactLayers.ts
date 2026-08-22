import { Database } from "@infrastructure/db/client";
import type { ContactRow, NewContact } from "@infrastructure/db/schema";
import { type ContactNotification, EmailClient } from "@infrastructure/email/server";
import { DatabaseError, EmailError } from "@infrastructure/errors";
import { Effect, Layer } from "effect";

export interface DatabaseDoubleOptions {
	contactWithinCooldown?: ContactRow;
	contactWithSameMessage?: ContactRow;
	failLookupWith?: DatabaseError;
	failInsertWith?: DatabaseError;
}

export interface CooldownLookup {
	email: string;
	since: string;
}

export interface MessageLookup {
	email: string;
	message: string;
}

export interface DatabaseDouble {
	layer: Layer.Layer<Database>;
	inserted: NewContact[];
	cooldownLookups: CooldownLookup[];
	messageLookups: MessageLookup[];
}

export interface ContactRowParams {
	email: string;
	overrides?: Partial<ContactRow>;
}

export const contactRow = ({ email, overrides = {} }: ContactRowParams): ContactRow => ({
	id: "contact-id",
	name: "Ada",
	email,
	message: "Hello there",
	emailId: "email-id",
	createdDate: "2026-07-30T09:15:00.000Z",
	modifiedDate: "2026-07-30T09:15:00.000Z",
	...overrides,
});

export function databaseDouble({
	contactWithinCooldown,
	contactWithSameMessage,
	failLookupWith,
	failInsertWith,
}: DatabaseDoubleOptions = {}): DatabaseDouble {
	const inserted: NewContact[] = [];
	const cooldownLookups: CooldownLookup[] = [];
	const messageLookups: MessageLookup[] = [];

	return {
		inserted,
		cooldownLookups,
		messageLookups,
		layer: Layer.succeed(Database, {
			findLatestContactSince: (params) => {
				cooldownLookups.push(params);

				return failLookupWith ? Effect.fail(failLookupWith) : Effect.succeed(contactWithinCooldown);
			},
			findContactWithMessage: (params) => {
				messageLookups.push(params);

				return failLookupWith ? Effect.fail(failLookupWith) : Effect.succeed(contactWithSameMessage);
			},
			insertContact: (contact) => {
				if (failInsertWith) return Effect.fail(failInsertWith);

				inserted.push(contact);

				return Effect.void;
			},
		}),
	};
}

export interface EmailDoubleOptions {
	id?: string;
	failWith?: EmailError;
}

export interface EmailDouble {
	layer: Layer.Layer<EmailClient>;
	sent: ContactNotification[];
}

export function emailDouble({ id = "email-id", failWith }: EmailDoubleOptions = {}): EmailDouble {
	const sent: ContactNotification[] = [];

	return {
		sent,
		layer: Layer.succeed(EmailClient, {
			sendContactNotification: (notification) => {
				if (failWith) return Effect.fail(failWith);

				sent.push(notification);

				return Effect.succeed({ id });
			},
		}),
	};
}

export const databaseError = (message: string, cause?: unknown) => new DatabaseError({ message, cause });

export const emailError = (message: string) => new EmailError({ message });
