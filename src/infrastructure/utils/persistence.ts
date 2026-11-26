import { contactCooldownStart, normalizeEmail } from "@domain/contact/rules";
import type { ValidatedContact } from "@domain/contact/types";
import { Effect } from "effect";
import { Database } from "../db/client";
import type { EmailId } from "../email/server";
import { type DatabaseError, DuplicateContactError } from "../errors";
import { LoggerService } from "../logging/service";

const ALREADY_HEARD_MESSAGE = "I've already received a message from you, and I'll reply as soon as I can.";
const COOLDOWN_REASON = "inside the cooldown window";
const REPEATED_REASON = "the same message as a previous submission";

export const checkDuplicateContact = Effect.fn("checkDuplicateContact")(function* (
	data: ValidatedContact,
): Effect.fn.Return<void, DatabaseError | DuplicateContactError, Database | LoggerService> {
	const database = yield* Database;
	const logger = yield* LoggerService;
	const email = normalizeEmail(data.email);

	const [withinCooldown, repeated] = yield* Effect.all(
		[
			database.findLatestContactSince({ email, since: contactCooldownStart(new Date()) }),
			database.findContactWithMessage({ email, message: data.message }),
		],
		{ concurrency: "unbounded" },
	);

	if (!repeated && !withinCooldown) {
		return;
	}

	logger.info({ message: "Contact refused", context: { reason: repeated ? REPEATED_REASON : COOLDOWN_REASON } });

	return yield* Effect.fail(new DuplicateContactError({ message: ALREADY_HEARD_MESSAGE }));
});

interface SaveContactParams extends ValidatedContact {
	emailId: EmailId;
}

export const saveContact = Effect.fn("saveContact")(function* (
	contactData: SaveContactParams,
): Effect.fn.Return<void, DatabaseError, Database> {
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
