import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

afterEach(cleanup);

describe("Textarea", () => {
	it("takes the attributes a textarea has, which an input does not", () => {
		render(<Textarea id="message" label="Message" hasError={false} rows={3} />);

		expect(screen.getByLabelText("Message").getAttribute("rows")).toBe("3");
	});

	it("points the field at its error only while there is one", () => {
		const { rerender } = render(<Textarea id="message" label="Message" hasError errorMessage="Too short" />);

		expect(screen.getByLabelText("Message").getAttribute("aria-describedby")).toBe("message-error");
		expect(screen.getByText("Too short").id).toBe("message-error");

		rerender(<Textarea id="message" label="Message" hasError={false} errorMessage="Too short" />);

		expect(screen.getByLabelText("Message").getAttribute("aria-describedby")).toBeNull();
	});

	it("locks the field and drops the underline mix when it is locked", () => {
		const { container } = render(<Textarea id="message" label="Message" hasError={false} isLocked />);

		expect((screen.getByLabelText("Message") as HTMLTextAreaElement).disabled).toBe(true);
		expect(container.firstElementChild?.classList.contains("underline-on-hover")).toBe(false);
	});
});
