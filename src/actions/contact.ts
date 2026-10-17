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
import { ContactLayer } from "@infrastructure/layers";
import { LoggerService } from "@infrastructure/logging/service";
import { sendEmail } from "@infrastructure/utils/email";
import { validateContact, verifyRecaptcha } from "@infrastructure/utils/guards";
import { checkDuplicateContact, saveContact } from "@infrastructure/utils/persistence";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";
import { type ContactErrorResponse, contactErrorResponse } from "./errorResponse";

export type ContactError = ValidationError | RecaptchaError | DuplicateContactError | EmailError | DatabaseError;

export interface SubmitContactParams extends Except<ContactFormData, "emailId"> {
	recaptcha: string;
}

export const submitContact = Effect.fn("submitContact")(function* ({
	recaptcha,
	...params
}: SubmitContactParams): Effect.fn.Return<{ ok: boolean }, ContactError, Database | EmailClient | LoggerService> {
	const logger = yield* LoggerService;
	const data = yield* validateContact(params);
	yield* verifyRecaptcha(recaptcha);
	yield* checkDuplicateContact(data);
	const { id: emailId } = yield* sendEmail(data);

	yield* saveContact({ emailId, ...data }).pipe(
		Effect.catch((error) =>
			Effect.sync(() =>
				logger.logError({ message: "Contact was delivered but not persisted", error, context: { emailId } }),
			),
		),
	);

	return { ok: true };
});

type ContactAnswer = { success: true; value: { ok: boolean } } | { success: false; error: ContactErrorResponse };

export const answerContact = (params: SubmitContactParams): Promise<ContactAnswer> =>
	Effect.runPromise(
		submitContact(params).pipe(
			Effect.provide(ContactLayer),
			Effect.matchCauseEffect({
				onSuccess: (value) => Effect.succeed({ success: true as const, value }),
				onFailure: (cause) =>
					contactErrorResponse(cause).pipe(Effect.map((error) => ({ success: false as const, error }))),
			}),
			Effect.provide(LoggerService.layer),
		),
	);
