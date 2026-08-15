import { toContactSubmission, UNDELIVERED_SUBMISSION } from "@modules/contact/utils/submission";
import { describe, expect, it } from "vitest";

describe("toContactSubmission", () => {
	it("answers ok when the action reports the message went out", () => {
		expect(toContactSubmission({ data: { ok: true } })).toEqual({ ok: true });
	});

	it("carries the action's status and copy through, so the form can tell a lockout from a retry", () => {
		expect(toContactSubmission({ error: { status: 401, message: "You already contacted me" } })).toEqual({
			ok: false,
			status: 401,
			message: "You already contacted me",
		});
	});

	it("treats an answer that is neither ok nor an error as undelivered rather than as success", () => {
		expect(toContactSubmission({ data: { ok: false } })).toEqual(UNDELIVERED_SUBMISSION);
		expect(toContactSubmission({})).toEqual(UNDELIVERED_SUBMISSION);
	});
});
