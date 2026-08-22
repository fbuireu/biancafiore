import { Input } from "@modules/contact/components/form/input/Input";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

type InputProps = Parameters<typeof Input>[0];

const renderInput = (props: Partial<InputProps> = {}) =>
	render(<Input id="email" label="Email" hasError={false} {...props} />);

const field = (): HTMLInputElement => screen.getByLabelText("Email") as HTMLInputElement;

describe("Input", () => {
	it("points an invalid field at the paragraph carrying its error message", () => {
		renderInput({ hasError: true, errorMessage: "Enter a valid email" });

		const described = document.getElementById(field().getAttribute("aria-describedby") ?? "");

		expect(field().getAttribute("aria-invalid")).toBe("true");
		expect(described?.textContent).toBe("Enter a valid email");
	});

	it("leaves a valid field with no error for assistive technology to announce", () => {
		renderInput({ errorMessage: "Enter a valid email" });

		expect(field().hasAttribute("aria-invalid")).toBe(false);
		expect(field().hasAttribute("aria-describedby")).toBe(false);
		expect(screen.queryByText("Enter a valid email")).toBeNull();
	});

	it("disables the field and withdraws the hover affordance while the form is locked", () => {
		const { container } = renderInput({ isLocked: true });

		expect(field().disabled).toBe(true);
		expect(container.querySelector(".contact-form__input-wrapper")?.className).not.toContain("underline-on-hover");
	});

	it("renders no label when there is no id for it to point at", () => {
		renderInput({ id: undefined });

		expect(screen.queryByText("Email")).toBeNull();
	});

	it("forwards the caller's own attributes onto the field", () => {
		renderInput({ name: "email", type: "email", required: true });

		expect(field().getAttribute("name")).toBe("email");
		expect(field().type).toBe("email");
		expect(field().required).toBe(true);
	});
});
