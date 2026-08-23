import * as schema from "@infrastructure/db/schema";
import { DatabaseError } from "@infrastructure/errors";
import { createClient } from "@libsql/client/web";
import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql/web";
import { Context, Effect, Layer } from "effect";

export interface FindLatestContactSinceParams {
	email: string;
	since: string;
}

export interface FindContactWithMessageParams {
	email: string;
	message: string;
}

export class Database extends Context.Tag("Database")<
	Database,
	{
		findLatestContactSince(
			params: FindLatestContactSinceParams,
		): Effect.Effect<schema.ContactRow | undefined, DatabaseError>;
		findContactWithMessage(
			params: FindContactWithMessageParams,
		): Effect.Effect<schema.ContactRow | undefined, DatabaseError>;
		insertContact(contact: schema.NewContact): Effect.Effect<void, DatabaseError>;
	}
>() {}

export const DatabaseLive = Layer.effect(
	Database,
	Effect.gen(function* () {
		const { getSecret } = yield* Effect.promise(() => import("astro:env/server"));
		const url = getSecret("ASTRO_DB_REMOTE_URL");
		const authToken = getSecret("ASTRO_DB_APP_TOKEN");

		if (!url || !authToken) {
			return yield* Effect.die(new Error("ASTRO_DB_REMOTE_URL and ASTRO_DB_APP_TOKEN must be defined"));
		}

		const db = drizzle(createClient({ url, authToken }), { schema });

		const run = <A>(query: PromiseLike<A>): Effect.Effect<A, DatabaseError> =>
			Effect.tryPromise({
				try: () => Promise.resolve(query),
				catch: (cause) =>
					new DatabaseError({
						message: cause instanceof Error ? cause.message : String(cause),
						cause,
					}),
			});

		return {
			findLatestContactSince: ({ email, since }: FindLatestContactSinceParams) =>
				run(
					db
						.select()
						.from(schema.Contact)
						.where(and(eq(schema.Contact.email, email), gte(schema.Contact.createdDate, since)))
						.orderBy(desc(schema.Contact.createdDate))
						.limit(1),
				).pipe(Effect.map((rows) => rows.at(0))),
			findContactWithMessage: ({ email, message }: FindContactWithMessageParams) =>
				run(
					db
						.select()
						.from(schema.Contact)
						.where(and(eq(schema.Contact.email, email), eq(schema.Contact.message, message)))
						.limit(1),
				).pipe(Effect.map((rows) => rows.at(0))),
			insertContact: (contact: schema.NewContact) => run(db.insert(schema.Contact).values(contact)).pipe(Effect.asVoid),
		};
	}),
);
