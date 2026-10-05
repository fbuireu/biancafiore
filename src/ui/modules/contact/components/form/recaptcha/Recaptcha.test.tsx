import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Recaptcha } from "./Recaptcha";

afterEach(cleanup);

describe("Recaptcha", () => {
	it("shows the refusal the form hands it, and no control of its own, since the token travels in the submission", () => {
		const { container } = render(<Recaptcha hasError errorMessage="Prove you are human" />);

		expect(screen.getByText("Prove you are human")).toBeDefined();
		expect(container.querySelector("input")).toBeNull();
	});

	it("shows nothing while the form has no refusal to report", () => {
		const { container } = render(<Recaptcha errorMessage="Prove you are human" />);

		expect(container.textContent).toBe("");
	});
});
