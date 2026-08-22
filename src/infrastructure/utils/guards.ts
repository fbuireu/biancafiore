import type { Except } from "@const/types";
import { BOT_REFUSAL_MESSAGE, contactFormSchema } from "@domain/contact/schema";
import { RecaptchaError, ValidationError } from "@infrastructure/errors";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const RECAPTCHA_MINIMUM_SCORE = 0.5;
const RECAPTCHA_ERROR_MESSAGE = `${BOT_REFUSAL_MESSAGE} Please refresh the page and try again.`;
const RECAPTCHA_UNANSWERED_MESSAGE = "reCAPTCHA siteverify could not be reached or did not answer readable JSON";
const RECAPTCHA_SECRET_MESSAGE = "reCAPTCHA refused GOOGLE_RECAPTCHA_SECRET_KEY, so no verdict was obtained";
const RECAPTCHA_SECRET_ERROR_CODES = new Set(["missing-input-secret", "invalid-input-secret"]);

type ValidateContact = Except<ContactFormData, "recaptcha" | "emailId">;

export const validateContact = (contact: ValidateContact): Effect.Effect<ValidateContact, ValidationError> =>
	Effect.suspend(() => {
		const { success, data, error } = contactFormSchema.omit({ recaptcha: true }).safeParse(contact);

		return success
			? Effect.succeed(data)
			: Effect.fail(
					new ValidationError({
						message: error?.issues.map((issue) => issue.message).join(", ") || "Invalid data",
					}),
				);
	});

type RecaptchaVerificationResponse = {
	success: boolean;
	score?: number;
	"error-codes"?: string[];
};

const refusedOurSecret = ({ success, "error-codes": errorCodes }: RecaptchaVerificationResponse): boolean =>
	!success && !!errorCodes?.some((code) => RECAPTCHA_SECRET_ERROR_CODES.has(code));

export const verifyRecaptcha = (token: string): Effect.Effect<void, ValidationError | RecaptchaError> =>
	Effect.gen(function* () {
		const { getSecret } = yield* Effect.promise(() => import("astro:env/server"));

		const verification = yield* Effect.tryPromise({
			try: async () => {
				const response = await fetch(RECAPTCHA_VERIFY_URL, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						secret: getSecret("GOOGLE_RECAPTCHA_SECRET_KEY") ?? "",
						response: token,
					}),
				});

				return (await response.json()) as RecaptchaVerificationResponse;
			},
			catch: (cause) => new RecaptchaError({ message: RECAPTCHA_UNANSWERED_MESSAGE, cause }),
		});

		if (refusedOurSecret(verification)) {
			return yield* Effect.fail(
				new RecaptchaError({ message: RECAPTCHA_SECRET_MESSAGE, cause: verification["error-codes"] }),
			);
		}

		if (!verification.success || (verification.score ?? 0) < RECAPTCHA_MINIMUM_SCORE) {
			return yield* Effect.fail(new ValidationError({ message: RECAPTCHA_ERROR_MESSAGE }));
		}
	});
