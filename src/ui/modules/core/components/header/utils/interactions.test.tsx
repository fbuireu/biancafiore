import { backgroundObserver, wireMenu } from "@modules/core/components/header/utils/interactions";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const HEADER_HEIGHT = 80;
const HEADER_MIDLINE = HEADER_HEIGHT / 2;
const MENU_OPEN_CLASS = "page--menu-open";
const INTERSECTED_BUTTON_CLASS = "header__menu-button--intersected";
const INTERSECTED_LOGO_CLASS = "logo--intersected";

interface PlaceParams {
	selector: string;
	top: number;
	height: number;
}

const place = ({ selector, top, height }: PlaceParams): void => {
	const element = document.querySelector(selector);

	if (!element) {
		throw new Error(`nothing matches ${selector}`);
	}

	element.getBoundingClientRect = () => ({ top, bottom: top + height, height }) as DOMRect;
};

const render = (markup: string): void => {
	document.documentElement.className = "";
	document.body.innerHTML = `
		<header class="header">
			<a class="site__logo"><svg></svg></a>
			<button class="header__menu-button"></button>
		</header>
		${markup}
	`;
	place({ selector: ".header", top: 0, height: HEADER_HEIGHT });
};

const logo = () => document.querySelector(".site__logo svg") as Element;
const menuButton = () => document.querySelector(".header__menu-button") as Element;
const isInverted = () =>
	logo().classList.contains(INTERSECTED_LOGO_CLASS) && menuButton().classList.contains(INTERSECTED_BUTTON_CLASS);

describe("backgroundObserver", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("inverts the logo and the menu button over any section carrying the mix, whatever its block", () => {
		render(`<section class="related-articles inverted-color-scheme"></section>`);
		place({ selector: ".related-articles", top: HEADER_MIDLINE - 10, height: 500 });

		backgroundObserver();

		expect(isInverted()).toBe(true);
	});

	it("tests every inverted section on the page, not only the first", () => {
		render(`
			<section class="blog inverted-color-scheme"></section>
			<footer class="inverted-color-scheme"></footer>
		`);
		place({ selector: ".blog", top: -900, height: 500 });
		place({ selector: "footer", top: HEADER_MIDLINE - 10, height: 500 });

		backgroundObserver();

		expect(isInverted()).toBe(true);
	});

	it("inverts over the footer on a page whose only inverted section is the footer", () => {
		render(`<footer class="inverted-color-scheme"></footer>`);
		place({ selector: "footer", top: HEADER_MIDLINE - 10, height: 500 });

		backgroundObserver();

		expect(isInverted()).toBe(true);
	});

	it("leaves the header alone over a section that does not carry the mix", () => {
		render(`<section class="blog"></section>`);
		place({ selector: ".blog", top: 0, height: 500 });

		backgroundObserver();

		expect(isInverted()).toBe(false);
	});

	it("reverts once the header has scrolled past every inverted section", () => {
		render(`<footer class="inverted-color-scheme"></footer>`);
		place({ selector: "footer", top: HEADER_MIDLINE - 10, height: 500 });
		backgroundObserver();

		place({ selector: "footer", top: HEADER_MIDLINE + 10, height: 500 });
		backgroundObserver();

		expect(isInverted()).toBe(false);
	});

	it("stops observing while the menu is open", () => {
		render(`<footer class="inverted-color-scheme"></footer>`);
		place({ selector: "footer", top: HEADER_MIDLINE - 10, height: 500 });
		document.documentElement.classList.add(MENU_OPEN_CLASS);

		backgroundObserver();

		expect(isInverted()).toBe(false);
	});

	it("does nothing on a page with no header", () => {
		document.body.innerHTML = `<footer class="inverted-color-scheme"></footer>`;

		expect(() => backgroundObserver()).not.toThrow();
	});
});

describe("wireMenu", () => {
	const render = () => {
		document.body.innerHTML = `
			<button class="header__menu-button"><span class="header__menu-text">Menu</span></button>
			<nav class="navigation__menu__nav"><a href="/about">About</a></nav>
			<main><a href="/articles">Articles</a></main>
			<footer><a href="/contact">Contact</a></footer>`;

		const button = document.querySelector<HTMLElement>(".header__menu-button") as HTMLElement;

		return {
			html: document.documentElement,
			button,
			text: document.querySelector<HTMLElement>(".header__menu-text"),
		};
	};

	const timelineDouble = () => {
		let reversed = true;

		return {
			calls: [] as boolean[],
			completed: undefined as (() => void) | undefined,
			eventCallback(_type: "onComplete", callback: () => void) {
				this.completed = callback;

				return this;
			},
			reversed(value?: boolean) {
				if (value === undefined) return reversed;

				reversed = value;
				this.calls.push(value);

				return reversed;
			},
		};
	};

	const wire = (controller: AbortController, elements = render()) => {
		const timeline = timelineDouble();

		wireMenu({ elements, signal: controller.signal, buildTimeline: () => timeline });

		return { elements, timeline };
	};

	afterEach(() => {
		document.body.innerHTML = "";
		document.documentElement.className = "";
	});

	it("opens on a click and says so to assistive technology", () => {
		const { elements } = wire(new AbortController());

		elements.button.click();

		expect(elements.button.getAttribute("aria-expanded")).toBe("true");
		expect(document.documentElement.classList.contains("page--menu-open")).toBe(true);
	});

	it("closes on a second click", () => {
		const { elements } = wire(new AbortController());

		elements.button.click();
		elements.button.click();

		expect(elements.button.getAttribute("aria-expanded")).toBe("false");
		expect(document.documentElement.classList.contains("page--menu-open")).toBe(false);
	});

	it("drives the timeline rather than animating anything itself", () => {
		const { elements, timeline } = wire(new AbortController());

		elements.button.click();

		expect(timeline.calls).toEqual([false]);
	});

	it("closes on Escape while the menu is open", () => {
		const { elements } = wire(new AbortController());

		elements.button.click();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		expect(elements.button.getAttribute("aria-expanded")).toBe("false");
	});

	it("ignores Escape while the menu is closed, so it cannot open it", () => {
		const { elements } = wire(new AbortController());

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		expect(elements.button.getAttribute("aria-expanded")).toBeNull();
	});

	it("stops listening on document once its signal is aborted, so a second run cannot stack a third", () => {
		const controller = new AbortController();
		const { elements } = wire(controller);

		elements.button.click();
		controller.abort();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		expect(elements.button.getAttribute("aria-expanded")).toBe("true");
	});

	it("clears the open state it inherited, so a swapped-in page never starts open", () => {
		document.documentElement.classList.add("page--menu-open");

		wire(new AbortController());

		expect(document.documentElement.classList.contains("page--menu-open")).toBe(false);
	});

	it("moves focus to the first menu link only once the overlay has finished opening", () => {
		const { elements, timeline } = wire(new AbortController());

		elements.button.click();

		expect(document.activeElement).not.toBe(document.querySelector(".navigation__menu__nav a"));

		timeline.completed?.();

		expect(document.activeElement).toBe(document.querySelector(".navigation__menu__nav a"));
	});

	it("takes the page the overlay covers out of the tab order while it is open", () => {
		const { elements } = wire(new AbortController());
		const covered = () => [...document.querySelectorAll<HTMLElement>("main, footer")];

		expect(covered().every((region) => region.inert)).toBe(false);

		elements.button.click();

		expect(covered().every((region) => region.inert)).toBe(true);

		elements.button.click();

		expect(covered().some((region) => region.inert)).toBe(false);
	});
});
