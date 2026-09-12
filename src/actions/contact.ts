import type { Except } from "@const/types";
import type { Database } from "@infrastructure/db/client";
import type { EmailClient } from "@infrastructure/email/server";
import type {
	DatabaseError,
	DuplicateContactError,
	EmailError,
	RecaptchaError,
	ValidationError,
} from "@infrastructure/errors";
import { LoggerService } from "@infrastructure/logging/service";
import { sendEmail } from "@infrastructure/utils/email";
import { validateContact, verifyRecaptcha } from "@infrastructure/utils/guards";
import { checkDuplicatedEntries, saveContact } from "@infrastructure/utils/persistence";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

export type ContactError = ValidationError | RecaptchaError | DuplicateContactError | EmailError | DatabaseError;

export type ContactParams = Except<ContactFormData, "emailId"> & { recaptcha: string };

export const submitContact = ({
	recaptcha,
	...params
}: ContactParams): Effect.Effect<{ ok: boolean }, ContactError, Database | EmailClient | LoggerService> =>
	Effect.gen(function* () {
		const logger = yield* LoggerService;
		const data = yield* validateContact(params);
		yield* verifyRecaptcha(recaptcha);
		yield* checkDuplicatedEntries(data);
		const { id: emailId } = yield* sendEmail(data);

		yield* saveContact({ emailId, ...data }).pipe(
			Effect.catchAll((error) =>
				Effect.sync(() =>
					logger.logError({ message: "Contact was delivered but not persisted", error, context: { emailId } }),
				),
			),
		);

		return { ok: true };
	});
