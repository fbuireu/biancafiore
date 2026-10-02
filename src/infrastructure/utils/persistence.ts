import type { Except } from "@const/types";
import { contactCooldownStart, normalizeEmail } from "@domain/contact/rules";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";
import { Database } from "../db/client";
import { type DatabaseError, DuplicateContactError } from "../errors";
import { LoggerService } from "../logging/service";

const ALREADY_HEARD_MESSAGE = "I've already received a message from you, and I'll reply as soon as I can.";
const COOLDOWN_REASON = "inside the cooldown window";
const REPEATED_REASON = "the same message as a previous submission";

type CheckDuplicateContactParams = Except<ContactFormData, "recaptcha" | "emailId">;

export const checkDuplicateContact = (
	data: CheckDuplicateContactParams,
): Effect.Effect<void, DatabaseError | DuplicateContactError, Database | LoggerService> =>
	Effect.gen(function* () {
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
