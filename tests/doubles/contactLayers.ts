import { Database } from "@infrastructure/db/client";
import { EmailClient } from "@infrastructure/email/server";
import { DatabaseError, EmailError } from "@infrastructure/errors";
import { Column, getTableName, Param, SQL, Table } from "drizzle-orm";
import { Effect, Layer } from "effect";
import type { CreateEmailOptions } from "resend";

type QueryKind = "select" | "insert";

export interface RecordedQuery {
	table?: string;
	column?: string;
	value?: unknown;
	limit?: number;
}

interface StubQuery {
	kind: QueryKind;
	recorded: RecordedQuery;
	from: (table: unknown) => StubQuery;
	where: (condition: unknown) => StubQuery;
	limit: (rows: number) => StubQuery;
	values: (row: Record<string, unknown>) => StubQuery;
	row?: Record<string, unknown>;
}

const tableNameOf = (table: unknown) => (table instanceof Table ? getTableName(table) : undefined);

const filterOf = (condition: unknown): Pick<RecordedQuery, "column" | "value"> => {
	if (!(condition instanceof SQL)) return {};

	const chunks: unknown[] = condition.queryChunks;
	const column = chunks.find((chunk): chunk is Column => chunk instanceof Column);
	const parameter = chunks.find((chunk): chunk is Param => chunk instanceof Param);

	return { column: column?.name, value: parameter?.value };
};

interface StubQueryParams {
	kind: QueryKind;
	table?: unknown;
}

const stubQuery = ({ kind, table }: StubQueryParams): StubQuery => {
	const query: StubQuery = {
		kind,
		recorded: { table: tableNameOf(table) },
		from: (from) => {
			query.recorded.table = tableNameOf(from);
			return query;
		},
		where: (condition) => {
			Object.assign(query.recorded, filterOf(condition));
			return query;
		},
		limit: (rows) => {
			query.recorded.limit = rows;
			return query;
		},
		values: (row) => {
			query.row = row;
			return query;
		},
	};

	return query;
};

const databaseErrorFrom = (cause: unknown) =>
	new DatabaseError({ message: cause instanceof Error ? cause.message : String(cause), cause });

export interface DatabaseDoubleOptions {
	duplicates?: unknown[];
	failSelectWith?: DatabaseError;
	failInsertWith?: DatabaseError;
	rejectInsertWith?: unknown;
}

export interface DatabaseDouble {
	layer: Layer.Layer<Database>;
	inserted: Record<string, unknown>[];
	selected: RecordedQuery[];
}

export function databaseDouble({
	duplicates = [],
	failSelectWith,
	failInsertWith,
	rejectInsertWith,
}: DatabaseDoubleOptions = {}): DatabaseDouble {
	const inserted: Record<string, unknown>[] = [];
	const selected: RecordedQuery[] = [];

	const db = {
		select: () => stubQuery({ kind: "select" }),
		insert: (table: unknown) => stubQuery({ kind: "insert", table }),
	};

	const run = (query: PromiseLike<unknown>) => {
		const { kind, recorded, row } = query as unknown as StubQuery;

		if (kind === "select") {
			selected.push(recorded);

			return failSelectWith ? Effect.fail(failSelectWith) : Effect.succeed(duplicates);
		}

		if (rejectInsertWith !== undefined) return Effect.fail(databaseErrorFrom(rejectInsertWith));

		if (failInsertWith) return Effect.fail(failInsertWith);

		if (row) inserted.push(row);

		return Effect.succeed(undefined);
	};

	return {
		inserted,
		selected,
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
