import type { ContactError } from "@actions/contact";
import { LoggerService } from "@infrastructure/logging/service";
import { Cause, Effect, Option } from "effect";

type ContactErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "INTERNAL_SERVER_ERROR";

export interface ContactErrorResponse {
	code: ContactErrorCode;
	message: string;
}

const GENERIC_ERROR_MESSAGE =
	"Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few minutes after refreshing the page.";

export const contactErrorResponse = (
	cause: Cause.Cause<ContactError>,
): Effect.Effect<ContactErrorResponse, never, LoggerService> => {
	const failure = Cause.failureOption(cause);

	if (Option.isSome(failure)) {
		switch (failure.value._tag) {
			case "ValidationError":
				return Effect.succeed({ code: "BAD_REQUEST", message: failure.value.message });
			case "DuplicateContactError":
				return Effect.succeed({ code: "UNAUTHORIZED", message: failure.value.message });
		}
	}

	return Effect.gen(function* () {
		const logger = yield* LoggerService;

		logger.error({ message: Cause.pretty(cause) });

		return { code: "INTERNAL_SERVER_ERROR", message: GENERIC_ERROR_MESSAGE };
	});
};
