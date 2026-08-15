import { Database } from "@infrastructure/db/client";
import type { ContactRow, NewContact } from "@infrastructure/db/schema";
import { EmailClient } from "@infrastructure/email/server";
import { DatabaseError, EmailError } from "@infrastructure/errors";
import { Effect, Layer } from "effect";
import type { CreateEmailOptions } from "resend";

export interface DatabaseDoubleOptions {
	existingContact?: ContactRow;
	failLookupWith?: DatabaseError;
	failInsertWith?: DatabaseError;
}

export interface DatabaseDouble {
	layer: Layer.Layer<Database>;
	inserted: NewContact[];
	lookedUp: string[];
}

export const contactRow = (email: string, overrides: Partial<ContactRow> = {}): ContactRow => ({
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
	existingContact,
	failLookupWith,
	failInsertWith,
}: DatabaseDoubleOptions = {}): DatabaseDouble {
	const inserted: NewContact[] = [];
	const lookedUp: string[] = [];

	return {
		inserted,
		lookedUp,
		layer: Layer.succeed(Database, {
			findContactByEmail: (email) => {
				lookedUp.push(email);

				return failLookupWith ? Effect.fail(failLookupWith) : Effect.succeed(existingContact);
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
	sent: { to: unknown; replyTo: unknown; subject: unknown }[];
}

export function emailDouble({ id = "email-id", failWith }: EmailDoubleOptions = {}): EmailDouble {
	const sent: { to: unknown; replyTo: unknown; subject: unknown }[] = [];

	return {
		sent,
		layer: Layer.succeed(EmailClient, {
			send: (payload: CreateEmailOptions) => {
				if (failWith) return Effect.fail(failWith);

				sent.push({ to: payload.to, replyTo: payload.replyTo, subject: payload.subject });

				return Effect.succeed({ id });
			},
		}),
	};
}

export const databaseError = (message: string, cause?: unknown) => new DatabaseError({ message, cause });

export const emailError = (message: string) => new EmailError({ message });
