import { Database } from "@infrastructure/db/client";
import { EmailClient } from "@infrastructure/email/server";
import { DatabaseError, EmailError } from "@infrastructure/errors";
import { Effect, Layer } from "effect";
import type { CreateEmailOptions } from "resend";

type QueryKind = "select" | "insert";

interface StubQuery {
	kind: QueryKind;
	from: () => StubQuery;
	where: () => StubQuery;
	limit: () => StubQuery;
	values: (row: Record<string, unknown>) => StubQuery;
	row?: Record<string, unknown>;
}

const stubQuery = (kind: QueryKind): StubQuery => {
	const query: StubQuery = {
		kind,
		from: () => query,
		where: () => query,
		limit: () => query,
		values: (row) => {
			query.row = row;
			return query;
		},
	};

	return query;
};

export interface DatabaseDoubleOptions {
	duplicates?: unknown[];
	failInsertWith?: DatabaseError;
}

export interface DatabaseDouble {
	layer: Layer.Layer<Database>;
	inserted: Record<string, unknown>[];
}

export function databaseDouble({ duplicates = [], failInsertWith }: DatabaseDoubleOptions = {}): DatabaseDouble {
	const inserted: Record<string, unknown>[] = [];

	const db = {
		select: () => stubQuery("select"),
		insert: () => stubQuery("insert"),
	};

	const run = (query: PromiseLike<unknown>) => {
		const { kind, row } = query as unknown as StubQuery;

		if (kind === "select") return Effect.succeed(duplicates);

		if (failInsertWith) return Effect.fail(failInsertWith);

		if (row) inserted.push(row);

		return Effect.succeed(undefined);
	};

	return {
		inserted,
		layer: Layer.succeed(Database, {
			db,
			run,
		} as unknown as Database["Type"]),
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
		} as unknown as EmailClient["Type"]),
	};
}

export const databaseError = (message: string) => new DatabaseError({ message });

export const emailError = (message: string) => new EmailError({ message });
