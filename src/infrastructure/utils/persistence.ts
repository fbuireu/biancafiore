import type { Except } from "@const/types";
import { Database } from "@infrastructure/db/client";
import { isUniqueConstraintViolation } from "@infrastructure/db/constraints";
import { type DatabaseError, DuplicateContactError } from "@infrastructure/errors";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

const DUPLICATE_CONTACT_MESSAGE = "You already contacted. Please be patient, I will get back to you ASAP.";

type CheckDuplicatedEntriesParams = Except<ContactFormData, "recaptcha" | "emailId">;

export const checkDuplicatedEntries = (
	data: CheckDuplicatedEntriesParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database> =>
	Effect.gen(function* () {
		const database = yield* Database;
		const existing = yield* database.findContactByEmail(data.email);

		if (existing) {
			return yield* Effect.fail(new DuplicateContactError({ message: DUPLICATE_CONTACT_MESSAGE }));
		}
	});

interface SaveContactParams extends Except<ContactFormData, "recaptcha"> {
	emailId: string;
}

export const saveContact = (
	contactData: SaveContactParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database> =>
	Effect.gen(function* () {
		const database = yield* Database;
		const now = new Date().toISOString();

		yield* database
			.insertContact({ ...contactData, id: crypto.randomUUID(), createdDate: now, modifiedDate: now })
			.pipe(
				Effect.catchTag(
					"DatabaseError",
					(error): Effect.Effect<never, DatabaseError | DuplicateContactError> =>
						isUniqueConstraintViolation(error.cause)
							? Effect.fail(new DuplicateContactError({ message: DUPLICATE_CONTACT_MESSAGE }))
							: Effect.fail(error),
				),
			);
	});
