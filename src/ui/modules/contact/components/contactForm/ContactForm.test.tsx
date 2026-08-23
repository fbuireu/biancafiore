import { ContactForm } from "@modules/contact/components/contactForm/ContactForm";
import { type ContactSubmission, UNDELIVERED_MESSAGE } from "@modules/contact/utils/submission";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VISITOR = {
	name: "Ada",
	email: "ada@example.com",
	message: "Would you write for us?",
};

const TOKEN = "recaptcha-token";
const SUCCESS_DELAY = 2000;

const ACTION_PATH = "/_actions/contact";

const renderForm = ({
	submit = vi.fn<(contactData: FormData) => Promise<ContactSubmission>>(async () => ({ ok: true })),
	getRecaptchaToken = vi.fn<() => Promise<string | undefined>>(async () => TOKEN),
} = {}) => {
	render(<ContactForm submit={submit} getRecaptchaToken={getRecaptchaToken} action={ACTION_PATH} />);

	return { submit, getRecaptchaToken };
};

const submitButton = (): HTMLButtonElement => screen.getByRole("button", { name: /Send email|Sending/ });

interface AnswerParams {
	label: string;
	value: string;
}

const answer = ({ label, value }: AnswerParams) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } });

const send = async () => {
	answer({ label: "(your name)", value: VISITOR.name });
	answer({ label: "(your email)", value: VISITOR.email });
	answer({ label: "(your message)", value: VISITOR.message });

	await act(async () => {
		fireEvent.submit(submitButton().closest("form") as HTMLFormElement);
		await vi.advanceTimersByTimeAsync(SUCCESS_DELAY);
	});
};

const sentFields = (contactData: FormData) => Object.fromEntries(contactData.entries());

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	cleanup();
});

describe("ContactForm", () => {
	it("sends the visitor's answers under the names the contact action validates", async () => {
		const { submit } = renderForm();

		await send();

		const [[contactData]] = submit.mock.calls;

		expect(submit).toHaveBeenCalledTimes(1);
		expect(sentFields(contactData)).toEqual({ ...VISITOR, recaptcha: TOKEN });
	});

	it("thanks the visitor and clears the form once the submission is accepted", async () => {
		renderForm();

		await send();

		expect(screen.getByText("Form sent correctly! Will be in touch soon")).toBeTruthy();
		expect(screen.queryByLabelText("(your name)")).toBeNull();
	});

	it("locks the form when the submission comes back unauthorized", async () => {
		const { submit } = renderForm({
			submit: vi.fn(async () => ({ ok: false, status: 401, message: "You already contacted me" })),
		});

		await send();

		expect(submit).toHaveBeenCalledTimes(1);
		expect(screen.getByText("You already contacted me")).toBeTruthy();
		expect(submitButton().disabled).toBe(true);
		expect((screen.getByLabelText("(your name)") as HTMLInputElement).disabled).toBe(true);
		expect(submitButton().closest("form")?.className).toContain("contact-form--disabled");
	});

	it("shows the rejection and leaves the form open when the submission fails for any other reason", async () => {
		renderForm({
			submit: vi.fn(async () => ({ ok: false, status: 500, message: "Something went wrong" })),
		});

		await send();

		expect(screen.getByText("Something went wrong")).toBeTruthy();
		expect(submitButton().disabled).toBe(false);
		expect((screen.getByLabelText("(your name)") as HTMLInputElement).disabled).toBe(false);
	});

	it("stops waiting when the submission never answers, instead of spinning forever", async () => {
		renderForm({
			submit: vi.fn(() => Promise.reject(new Error("Failed to fetch"))),
		});

		await send();

		expect(screen.getByText(UNDELIVERED_MESSAGE)).toBeTruthy();
		expect(submitButton().className).not.toContain("contact-form__submit--loading");
	});

	it("never submits without a reCAPTCHA token, and says so on the field", async () => {
		const { submit } = renderForm({ getRecaptchaToken: vi.fn(async () => undefined) });

		await send();

		expect(submit).not.toHaveBeenCalled();
		expect(screen.getByText("Mr. Robot, is that you?")).toBeTruthy();
	});

	it("treats a reCAPTCHA call that throws as a missing token", async () => {
		const { submit } = renderForm({
			getRecaptchaToken: vi.fn(() => Promise.reject(new Error("grecaptcha is not defined"))),
		});

		await send();

		expect(submit).not.toHaveBeenCalled();
		expect(screen.getByText("Mr. Robot, is that you?")).toBeTruthy();
	});

	it("waits rather than accusing the visitor when reCAPTCHA has not loaded yet", async () => {
		const submit = vi.fn<(contactData: FormData) => Promise<ContactSubmission>>(async () => ({ ok: true }));
		render(<ContactForm submit={submit} action={ACTION_PATH} />);

		await send();

		expect(submit).not.toHaveBeenCalled();
		expect(screen.queryByText("Mr. Robot, is that you?")).toBeNull();
	});
});
