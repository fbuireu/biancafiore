import { CONTACT_DETAILS } from "@const/index";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	activateEmailButtons,
	EMAIL_ADDRESS_PLACEHOLDER,
	EMAIL_BUTTON_ADDRESS_CLASS,
	EMAIL_BUTTON_CLASS,
} from "./interactions";

const ADDRESS = atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA);

const button = ({ shows }: { shows: "label" | "address" }): HTMLButtonElement => {
	const element = document.createElement("button");

	element.type = "button";
	element.className = shows === "address" ? `${EMAIL_BUTTON_CLASS} ${EMAIL_BUTTON_ADDRESS_CLASS}` : EMAIL_BUTTON_CLASS;
	element.textContent = shows === "address" ? EMAIL_ADDRESS_PLACEHOLDER : "Email me";
	document.body.append(element);

	return element;
};

const click = (element: HTMLElement, { trusted }: { trusted: boolean }) => {
	const event = new MouseEvent("click", { bubbles: true, cancelable: true });

	Object.defineProperty(event, "isTrusted", { value: trusted });
	element.dispatchEvent(event);
};

const composerTargets = () => vi.spyOn(window.location, "assign").mockImplementation(() => undefined);

afterEach(() => {
	vi.restoreAllMocks();
	document.body.innerHTML = "";
});

describe("activateEmailButtons", () => {
	it("opens the composer at the address the module owns, which no caller supplies", () => {
		const assign = composerTargets();
		const element = button({ shows: "label" });

		activateEmailButtons();
		click(element, { trusted: true });

		expect(assign).toHaveBeenCalledWith(`mailto:${ADDRESS}`);
	});

	it("ignores a click no human made, so a script cannot harvest the address", () => {
		const assign = composerTargets();
		const element = button({ shows: "label" });

		activateEmailButtons();
		click(element, { trusted: false });

		expect(assign).not.toHaveBeenCalled();
	});

	it("does nothing until the module is activated", () => {
		const assign = composerTargets();
		const element = button({ shows: "label" });

		click(element, { trusted: true });

		expect(assign).not.toHaveBeenCalled();
	});

	it("prints the address only in the browser, replacing the placeholder the server rendered", () => {
		const element = button({ shows: "address" });

		expect(element.textContent).toBe(EMAIL_ADDRESS_PLACEHOLDER);

		activateEmailButtons();

		expect(element.textContent).toBe(ADDRESS);
	});

	it("leaves a labelled button reading as its label", () => {
		const element = button({ shows: "label" });

		activateEmailButtons();

		expect(element.textContent).toBe("Email me");
	});

	it("activates the buttons under the root it is given, and no others", () => {
		const assign = composerTargets();
		const outside = button({ shows: "label" });
		const root = document.createElement("div");
		const inside = button({ shows: "label" });

		root.append(inside);
		document.body.append(root);

		activateEmailButtons(root);
		click(outside, { trusted: true });

		expect(assign).not.toHaveBeenCalled();

		click(inside, { trusted: true });

		expect(assign).toHaveBeenCalledWith(`mailto:${ADDRESS}`);
	});

	it("wires a button once, however often it is activated", () => {
		const assign = composerTargets();
		const element = button({ shows: "label" });

		activateEmailButtons();
		activateEmailButtons();
		click(element, { trusted: true });

		expect(assign).toHaveBeenCalledTimes(1);
	});
});
