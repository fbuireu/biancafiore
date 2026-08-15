import * as schema from "@infrastructure/db/schema";
import { DatabaseError } from "@infrastructure/errors";
import { createClient } from "@libsql/client/web";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql/web";
import { Context, Effect, Layer } from "effect";

export class Database extends Context.Tag("Database")<
	Database,
	{
		findContactByEmail(email: string): Effect.Effect<schema.ContactRow | undefined, DatabaseError>;
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
			findContactByEmail: (email: string) =>
				run(db.select().from(schema.Contact).where(eq(schema.Contact.email, email)).limit(1)).pipe(
					Effect.map((rows) => rows.at(0)),
				),
			insertContact: (contact: schema.NewContact) => run(db.insert(schema.Contact).values(contact)).pipe(Effect.asVoid),
		};
	}),
);
