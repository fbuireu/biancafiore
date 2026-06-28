import type { Except } from "@const/types";
import { Database } from "@infrastructure/db/client";
import { Contact } from "@infrastructure/db/schema";
import { type DatabaseError, DuplicateContactError } from "@infrastructure/errors";
import type { ContactFormData } from "@shared/ui/types";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

type CheckDuplicatedEntriesParams = Except<ContactFormData, "recaptcha" | "emailId">;

const ALIAS_REGEX = /(\+.*?)(?=@)/;

export const checkDuplicatedEntries = (
	data: CheckDuplicatedEntriesParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database> =>
	Effect.gen(function* () {
		const { db, run } = yield* Database;
		const duplicates = yield* run(
			db
				.select()
				.from(Contact)
				.where(eq(Contact.email, data.email.replace(ALIAS_REGEX, "")))
				.limit(1),
		);

		if (duplicates.length) {
			return yield* Effect.fail(
				new DuplicateContactError({
					message: "You already contacted. Please be patient, I will get back to you ASAP.",
				}),
			);
		}
	});
