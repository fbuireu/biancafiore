import type { ContactError } from "@actions/contact";
import { type ContactErrorResponse, contactErrorResponse } from "@actions/errorResponse";
import {
	DatabaseError,
	DuplicateContactError,
	EmailError,
	RecaptchaError,
	ValidationError,
} from "@infrastructure/errors";
import { Cause, Effect, Logger } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

const RAISED_MESSAGE = "the copy written where the error was raised";

interface CapturedLog {
	level: string;
	message: string;
}

const logged: CapturedLog[] = [];

const capturingLogger = Logger.replace(
	Logger.defaultLogger,
	Logger.make(({ logLevel, message }) => {
		logged.push({
			level: logLevel.label,
			message: (Array.isArray(message) ? message : [message]).map(String).join(" "),
		});
	}),
);

const raise: Record<ContactError["_tag"], (message: string) => ContactError> = {
	ValidationError: (message) => new ValidationError({ message }),
	RecaptchaError: (message) => new RecaptchaError({ message }),
	DuplicateContactError: (message) => new DuplicateContactError({ message }),
	EmailError: (message) => new EmailError({ message }),
	DatabaseError: (message) => new DatabaseError({ message }),
};

const respondTo = (cause: Cause.Cause<ContactError>): Promise<ContactErrorResponse> =>
	Effect.runPromise(contactErrorResponse(cause).pipe(Effect.provide(capturingLogger)));

beforeEach(() => {
	logged.length = 0;
});

describe("contactErrorResponse", () => {
	it("answers a validation failure with BAD_REQUEST and the copy the schema wrote", async () => {
		const response = await respondTo(Cause.fail(raise.ValidationError(RAISED_MESSAGE)));

		expect(response).toStrictEqual({ code: "BAD_REQUEST", message: RAISED_MESSAGE });
		expect(logged).toEqual([]);
	});

	it("answers a duplicate with UNAUTHORIZED and the copy persistence wrote", async () => {
		const response = await respondTo(Cause.fail(raise.DuplicateContactError(RAISED_MESSAGE)));

		expect(response).toStrictEqual({ code: "UNAUTHORIZED", message: RAISED_MESSAGE });
		expect(logged).toEqual([]);
	});

	it("gives every contact error the status the guide documents", async () => {
		const answers = await Promise.all(
			Object.entries(raise).map(async ([tag, raiseError]) => {
				const { code } = await respondTo(Cause.fail(raiseError(RAISED_MESSAGE)));

				return [tag, code];
			}),
		);

		expect(Object.fromEntries(answers)).toStrictEqual({
			ValidationError: "BAD_REQUEST",
			RecaptchaError: "INTERNAL_SERVER_ERROR",
			DuplicateContactError: "UNAUTHORIZED",
			EmailError: "INTERNAL_SERVER_ERROR",
			DatabaseError: "INTERNAL_SERVER_ERROR",
		});
	});

	it("logs a reCAPTCHA outage instead of letting it read as a rejected visitor", async () => {
		const response = await respondTo(Cause.fail(raise.RecaptchaError("siteverify unreachable")));

		expect(response.code).toBe("INTERNAL_SERVER_ERROR");
		expect(response.message).not.toContain("siteverify unreachable");
		expect(logged).toHaveLength(1);
		expect(logged[0]?.message).toContain("siteverify unreachable");
	});

	it("keeps the copy of an unmapped tag away from the visitor, behind one generic message", async () => {
		const email = await respondTo(Cause.fail(raise.EmailError(RAISED_MESSAGE)));
		const database = await respondTo(Cause.fail(raise.DatabaseError("turso unreachable")));

		expect(email.message).not.toContain(RAISED_MESSAGE);
		expect(database.message).toBe(email.message);
	});

	it("logs the pretty cause at error level whenever it collapses one", async () => {
		await respondTo(Cause.fail(raise.EmailError("resend down")));

		expect(logged).toHaveLength(1);
		expect(logged[0]?.level).toBe("ERROR");
		expect(logged[0]?.message).toContain("resend down");
	});

	it("treats a defect as unmapped, even one carrying a tag it would otherwise map", async () => {
		const response = await respondTo(Cause.die(raise.ValidationError(RAISED_MESSAGE)));

		expect(response.code).toBe("INTERNAL_SERVER_ERROR");
		expect(response.message).not.toContain(RAISED_MESSAGE);
		expect(logged).toHaveLength(1);
	});

	it("treats a thrown string defect the same way, and still logs it", async () => {
		const response = await respondTo(Cause.die("boom"));

		expect(response.code).toBe("INTERNAL_SERVER_ERROR");
		expect(logged[0]?.message).toContain("boom");
	});
});
