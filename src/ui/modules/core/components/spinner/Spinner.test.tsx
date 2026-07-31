import Spinner from "@modules/core/components/spinner/Spinner";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

describe("Spinner", () => {
	it("names the graphic so the wait is announced rather than silent", () => {
		render(<Spinner />);

		expect(screen.getByTitle("Loading...")).toBeDefined();
	});

	it("carries the spinner class the stylesheet animates", () => {
		const { container } = render(<Spinner />);

		expect(container.querySelector("svg")?.getAttribute("class")).toBe("spinner");
	});

	it("forwards the caller's own attributes onto the graphic", () => {
		const { container } = render(<Spinner aria-hidden="true" />);

		expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
	});
});
