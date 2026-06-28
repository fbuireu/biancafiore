import * as schema from "@infrastructure/db/schema";
import { DatabaseError } from "@infrastructure/errors";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql/web";
import { Context, Effect, Layer } from "effect";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

export class Database extends Context.Tag("Database")<
	Database,
	{
		readonly db: DrizzleClient;
		run<A>(query: PromiseLike<A>): Effect.Effect<A, DatabaseError>;
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

		return {
			db,
			run: <A>(query: PromiseLike<A>): Effect.Effect<A, DatabaseError> =>
				Effect.tryPromise({
					try: () => Promise.resolve(query),
					catch: (cause) =>
						new DatabaseError({
							message: cause instanceof Error ? cause.message : String(cause),
							cause,
						}),
				}),
		};
	}),
);
