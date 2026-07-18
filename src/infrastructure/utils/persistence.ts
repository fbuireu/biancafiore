import type { Except } from "@const/types";
import { Database } from "@infrastructure/db/client";
import { Contact } from "@infrastructure/db/schema";
import { type DatabaseError, DuplicateContactError } from "@infrastructure/errors";
import { LibsqlError } from "@libsql/client/web";
import type { ContactFormData } from "@shared/ui/types";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

type CheckDuplicatedEntriesParams = Except<ContactFormData, "recaptcha" | "emailId">;

export const checkDuplicatedEntries = (
	data: CheckDuplicatedEntriesParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database> =>
	Effect.gen(function* () {
		const { db, run } = yield* Database;
		const duplicates = yield* run(db.select().from(Contact).where(eq(Contact.email, data.email)).limit(1));

		if (duplicates.length) {
			return yield* Effect.fail(
				new DuplicateContactError({
					message: "You already contacted. Please be patient, I will get back to you ASAP.",
				}),
			);
		}
	});

interface SaveContactParams extends Except<ContactFormData, "recaptcha"> {
	emailId: string;
}

function isUniqueConstraintViolation(cause: unknown): boolean {
	return cause instanceof LibsqlError && cause.code.startsWith("SQLITE_CONSTRAINT");
}

export const saveContact = (
	contactData: SaveContactParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database> =>
	Effect.gen(function* () {
		const { db, run } = yield* Database;

		yield* run(
			db.insert(Contact).values({
				...contactData,
				id: crypto.randomUUID(),
				createdDate: new Date().toISOString(),
				modifiedDate: new Date().toISOString(),
			}),
		).pipe(
			Effect.catchTag(
				"DatabaseError",
				(error): Effect.Effect<never, DatabaseError | DuplicateContactError> =>
					isUniqueConstraintViolation(error.cause)
						? Effect.fail(
								new DuplicateContactError({
									message: "You already contacted. Please be patient, I will get back to you ASAP.",
								}),
							)
						: Effect.fail(error),
			),
		);
	});
