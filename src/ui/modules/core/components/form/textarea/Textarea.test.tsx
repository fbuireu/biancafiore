import { Textarea } from "@modules/core/components/form/textarea";
import { FormStatus } from "@shared/ui/types";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

type TextareaProps = Parameters<typeof Textarea>[0];

const renderTextarea = (props: Partial<TextareaProps> = {}) =>
	render(<Textarea id="message" label="Message" formStatus={FormStatus.INITIAL} hasError={false} {...props} />);

const field = (): HTMLTextAreaElement => screen.getByLabelText("Message") as HTMLTextAreaElement;

describe("Textarea", () => {
	it("points an invalid field at the paragraph carrying its error message", () => {
		renderTextarea({ hasError: true, errorMessage: "Tell us a little more" });

		const described = document.getElementById(field().getAttribute("aria-describedby") ?? "");

		expect(field().getAttribute("aria-invalid")).toBe("true");
		expect(described?.textContent).toBe("Tell us a little more");
	});

	it("leaves a valid field with no error for assistive technology to announce", () => {
		renderTextarea({ errorMessage: "Tell us a little more" });

		expect(field().hasAttribute("aria-invalid")).toBe(false);
		expect(field().hasAttribute("aria-describedby")).toBe(false);
		expect(screen.queryByText("Tell us a little more")).toBeNull();
	});

	it("disables the field and withdraws the hover affordance while the form is unauthorized", () => {
		const { container } = renderTextarea({ formStatus: FormStatus.UNAUTHORIZED });

		expect(field().disabled).toBe(true);
		expect(container.querySelector(".contact-form__textarea-wrapper")?.className).not.toContain("underline-on-hover");
	});

	it("forwards the caller's own attributes onto the field", () => {
		renderTextarea({ name: "message", maxLength: 500, required: true });

		expect(field().getAttribute("name")).toBe("message");
		expect(field().maxLength).toBe(500);
		expect(field().required).toBe(true);
	});
});
