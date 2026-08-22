import type { Except } from "@const/types";
import { CONTACT_COOLDOWN_HOURS, contactCooldownStart, normalizeEmail } from "@domain/contact/rules";
import { Database } from "@infrastructure/db/client";
import { type DatabaseError, DuplicateContactError } from "@infrastructure/errors";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

const COOLDOWN_MESSAGE = `You already contacted me in the last ${CONTACT_COOLDOWN_HOURS} hours. Please be patient, I will get back to you ASAP.`;
const REPEATED_MESSAGE = "You already sent me this exact message. Please be patient, I will get back to you ASAP.";

type CheckDuplicatedEntriesParams = Except<ContactFormData, "recaptcha" | "emailId">;

export const checkDuplicatedEntries = (
	data: CheckDuplicatedEntriesParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database> =>
	Effect.gen(function* () {
		const database = yield* Database;
		const email = normalizeEmail(data.email);

		const [withinCooldown, repeated] = yield* Effect.all(
			[
				database.findLatestContactSince({ email, since: contactCooldownStart(new Date()) }),
				database.findContactWithMessage({ email, message: data.message }),
			],
			{ concurrency: "unbounded" },
		);

		if (repeated) {
			return yield* Effect.fail(new DuplicateContactError({ message: REPEATED_MESSAGE }));
		}

		if (withinCooldown) {
			return yield* Effect.fail(new DuplicateContactError({ message: COOLDOWN_MESSAGE }));
		}
	});

interface SaveContactParams extends Except<ContactFormData, "recaptcha"> {
	emailId: string;
}

export const saveContact = (contactData: SaveContactParams): Effect.Effect<void, DatabaseError, Database> =>
	Effect.gen(function* () {
		const database = yield* Database;
		const now = new Date().toISOString();

		yield* database.insertContact({
			...contactData,
			email: normalizeEmail(contactData.email),
			id: crypto.randomUUID(),
			createdDate: now,
			modifiedDate: now,
		});
	});
