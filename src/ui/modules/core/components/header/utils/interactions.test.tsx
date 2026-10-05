import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOGO_INTERSECTED_CLASS, LOGO_LINK_CLASS } from "../../logo/const";
import {
	HEADER_CLASS,
	HEADER_MENU_BUTTON_CLASS,
	HEADER_MENU_BUTTON_INTERSECTED_CLASS,
	HEADER_MENU_BUTTON_OUTLINE_CLASS,
	HEADER_MENU_CLASS,
	HEADER_MENU_ITEM_CLASS,
	HEADER_MENU_NAV_CLASS,
	HEADER_MENU_OVERLAY_CLASS,
	HEADER_MENU_QUOTE_CLASS,
	HEADER_MENU_TEXT_CLASS,
	MENU_OPEN_CLASS,
} from "../const";
import { backgroundObserver, initMenu, watchBackground, wireMenu } from "./interactions";

const HEADER_HEIGHT = 80;
const HEADER_MIDLINE = HEADER_HEIGHT / 2;

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
		<header class="${HEADER_CLASS}">
			<a class="${LOGO_LINK_CLASS}"><svg></svg></a>
			<button class="${HEADER_MENU_BUTTON_CLASS}"></button>
		</header>
		${markup}
	`;
	place({ selector: `.${HEADER_CLASS}`, top: 0, height: HEADER_HEIGHT });
};

const logo = () => document.querySelector(`.${LOGO_LINK_CLASS} svg`) as Element;
const menuButton = () => document.querySelector(`.${HEADER_MENU_BUTTON_CLASS}`) as Element;
const isInverted = () =>
	logo().classList.contains(LOGO_INTERSECTED_CLASS) &&
	menuButton().classList.contains(HEADER_MENU_BUTTON_INTERSECTED_CLASS);

describe("backgroundObserver", () => {
	afterEach(() => {
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
			<button class="${HEADER_MENU_BUTTON_CLASS}"><span class="${HEADER_MENU_TEXT_CLASS}">Menu</span></button>
			<nav class="${HEADER_MENU_NAV_CLASS}"><a href="/about">About</a></nav>
			<main><a href="/articles">Articles</a></main>
			<footer><a href="/contact">Contact</a></footer>`;

		const button = document.querySelector<HTMLElement>(`.${HEADER_MENU_BUTTON_CLASS}`) as HTMLElement;

		return {
			html: document.documentElement,
			button,
			text: document.querySelector<HTMLElement>(`.${HEADER_MENU_TEXT_CLASS}`),
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

	let controller: AbortController;

	beforeEach(() => {
		controller = new AbortController();
	});

	const wire = () => {
		const elements = render();
		const timeline = timelineDouble();
		const buildTimeline = vi.fn(() => Promise.resolve(timeline));

		wireMenu({ elements, signal: controller.signal, buildTimeline });

		return { elements, timeline, buildTimeline };
	};

	const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

	afterEach(() => {
		controller.abort();
		document.body.innerHTML = "";
		document.documentElement.className = "";
	});

	it("opens on a click and says so to assistive technology", () => {
		const { elements } = wire();

		elements.button.click();

		expect(elements.button.getAttribute("aria-expanded")).toBe("true");
		expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(true);
	});

	it("closes on a second click", () => {
		const { elements } = wire();

		elements.button.click();
		elements.button.click();

		expect(elements.button.getAttribute("aria-expanded")).toBe("false");
		expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(false);
	});

	it("drives the timeline rather than animating anything itself", async () => {
		const { elements, timeline } = wire();

		elements.button.click();
		await settle();

		expect(timeline.calls).toEqual([false]);
	});

	it("asks for the timeline on the first click and not before, so nothing animates before a reader opens the menu", async () => {
		const { elements, buildTimeline } = wire();

		await settle();
		expect(buildTimeline).not.toHaveBeenCalled();

		elements.button.click();
		await settle();

		expect(buildTimeline).toHaveBeenCalledTimes(1);
	});

	it("builds the timeline once however many times the button is clicked", async () => {
		const { elements, buildTimeline, timeline } = wire();

		elements.button.click();
		await settle();
		elements.button.click();
		await settle();
		elements.button.click();
		await settle();

		expect(buildTimeline).toHaveBeenCalledTimes(1);
		expect(timeline.calls).toEqual([false, true, false]);
	});

	it("ends in the direction the last click chose when it is clicked again before the timeline is ready", async () => {
		const elements = render();
		const timeline = timelineDouble();
		let ready: (value: ReturnType<typeof timelineDouble>) => void = () => undefined;

		wireMenu({
			elements,
			signal: controller.signal,
			buildTimeline: () => new Promise((resolve) => (ready = resolve)),
		});

		elements.button.click();
		elements.button.click();
		ready(timeline);
		await settle();

		expect(elements.button.getAttribute("aria-expanded")).toBe("false");
		expect(timeline.calls).toEqual([true, true]);
	});

	it("closes on Escape while the menu is open", () => {
		const { elements } = wire();

		elements.button.click();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		expect(elements.button.getAttribute("aria-expanded")).toBe("false");
	});

	it("ignores Escape while the menu is closed, so it cannot open it", () => {
		const { elements } = wire();

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		expect(elements.button.getAttribute("aria-expanded")).toBeNull();
	});

	it("stops listening on document once its signal is aborted, so a second run cannot stack a third", () => {
		const { elements } = wire();

		elements.button.click();
		controller.abort();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		expect(elements.button.getAttribute("aria-expanded")).toBe("true");
	});

	it("clears the open state it inherited, so a swapped-in page never starts open", () => {
		document.documentElement.classList.add(MENU_OPEN_CLASS);

		wire();

		expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(false);
	});

	it("moves focus to the first menu link only once the overlay has finished opening", async () => {
		const { elements, timeline } = wire();

		elements.button.click();
		await settle();

		expect(document.activeElement).not.toBe(document.querySelector(`.${HEADER_MENU_NAV_CLASS} a`));

		timeline.completed?.();

		expect(document.activeElement).toBe(document.querySelector(`.${HEADER_MENU_NAV_CLASS} a`));
	});

	it("takes the page the overlay covers out of the tab order while it is open", () => {
		const { elements } = wire();
		const covered = () => [...document.querySelectorAll<HTMLElement>("main, footer")];

		expect(covered().every((region) => region.inert)).toBe(false);

		elements.button.click();

		expect(covered().every((region) => region.inert)).toBe(true);

		elements.button.click();

		expect(covered().some((region) => region.inert)).toBe(false);
	});
});

describe("watchBackground", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		document.documentElement.className = "";
		vi.restoreAllMocks();
	});

	it("paints the header once immediately rather than waiting for the first scroll", () => {
		render(`<section class="hero inverted-color-scheme"></section>`);
		place({ selector: ".hero", top: HEADER_MIDLINE - 10, height: 500 });

		watchBackground();

		expect(isInverted()).toBe(true);
	});

	it("listens passively, so the observer cannot block the scroll it reacts to", () => {
		const addEventListener = vi.spyOn(window, "addEventListener");
		render("");

		watchBackground();

		expect(addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
	});

	it("repaints on a scroll rather than only on the load", () => {
		render(`<section class="hero inverted-color-scheme"></section>`);
		place({ selector: ".hero", top: 1000, height: 500 });
		watchBackground();
		expect(isInverted()).toBe(false);

		place({ selector: ".hero", top: HEADER_MIDLINE - 10, height: 500 });
		window.dispatchEvent(new Event("scroll"));

		expect(isInverted()).toBe(true);
	});
});

describe("the menu button label", () => {
	const CLOSE_LABEL_DELAY = 500;

	let controller: AbortController;

	const wireWithUpdates = (text: HTMLElement | null) => {
		document.body.innerHTML = `<button class="${HEADER_MENU_BUTTON_CLASS}"></button>`;
		const button = document.querySelector<HTMLElement>(`.${HEADER_MENU_BUTTON_CLASS}`) as HTMLElement;
		if (text) button.appendChild(text);

		let update = () => {};

		wireMenu({
			elements: { html: document.documentElement, button, text },
			signal: controller.signal,
			buildTimeline: (onButtonUpdate) => {
				update = onButtonUpdate;

				return Promise.resolve({
					eventCallback: () => undefined,
					reversed: (value?: boolean) => (value === undefined ? true : value),
				});
			},
		});

		return { button, update: () => update() };
	};

	const label = () => {
		const element = document.createElement("span");
		element.className = HEADER_MENU_TEXT_CLASS;
		element.textContent = "Menu";

		return element;
	};

	beforeEach(() => {
		controller = new AbortController();
		vi.useFakeTimers();
	});

	afterEach(() => {
		controller.abort();
		vi.useRealTimers();
		document.body.innerHTML = "";
		document.documentElement.className = "";
		document.documentElement.style.overflow = "";
	});

	it("waits for the overlay to cover the page before it reads Close", () => {
		const text = label();
		const { button, update } = wireWithUpdates(text);

		button.click();
		update();

		expect(text.textContent).toBe("Menu");

		vi.advanceTimersByTime(CLOSE_LABEL_DELAY);

		expect(text.textContent).toBe("Close");
	});

	it("goes back to Menu with no delay, so the label is never behind the overlay", () => {
		const text = label();
		const { button, update } = wireWithUpdates(text);

		button.click();
		update();
		vi.advanceTimersByTime(CLOSE_LABEL_DELAY);

		button.click();
		update();
		vi.advanceTimersByTime(0);

		expect(text.textContent).toBe("Menu");
	});

	it("locks the page behind an open menu and releases it on close", () => {
		const { button, update } = wireWithUpdates(label());

		button.click();
		update();
		expect(document.documentElement.style.overflow).toBe("hidden");

		button.click();
		update();
		expect(document.documentElement.style.overflow).toBe("initial");
	});

	it("does not touch the page's overflow when there is no label to update", () => {
		const { button, update } = wireWithUpdates(null);

		button.click();
		update();

		expect(document.documentElement.style.overflow).toBe("");
	});
});

describe("initMenu", () => {
	const render = () => {
		document.documentElement.className = "";
		document.body.innerHTML = `
			<button class="${HEADER_MENU_BUTTON_CLASS}"><span class="${HEADER_MENU_TEXT_CLASS}">Menu</span></button>
			<div class="${HEADER_MENU_OVERLAY_CLASS}"><svg><path d="M0 0"></path></svg></div>
			<div class="${HEADER_MENU_BUTTON_OUTLINE_CLASS}"></div>
			<nav class="${HEADER_MENU_CLASS}">
				<div class="${HEADER_MENU_NAV_CLASS}"><a href="/about">About</a></div>
				<li class="${HEADER_MENU_ITEM_CLASS}"><a href="/projects">Projects</a></li>
				<div class="${HEADER_MENU_QUOTE_CLASS}"><p>A quote</p></div>
			</nav>
			<main></main>`;

		return document.querySelector<HTMLElement>(`.${HEADER_MENU_BUTTON_CLASS}`) as HTMLElement;
	};

	afterEach(() => {
		document.body.innerHTML = "";
		document.documentElement.className = "";
		document.documentElement.style.overflow = "";
	});

	it("does nothing on a page with no menu button", () => {
		document.body.innerHTML = "";

		expect(() => initMenu()).not.toThrow();
	});

	it("wires the real timeline, so a click opens the menu", async () => {
		const button = render();

		initMenu();
		button.click();
		await vi.dynamicImportSettled();

		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(true);
	});

	it("plays the real timeline once the library has arrived, which shows the overlay", async () => {
		const button = render();
		const overlay = document.querySelector<HTMLElement>(`.${HEADER_MENU_OVERLAY_CLASS}`) as HTMLElement;

		initMenu();
		button.click();
		await vi.dynamicImportSettled();
		await vi.waitFor(() => expect(overlay.style.display).toBe("block"), { timeout: 2000 });
	});

	it("marks the button so a second page-load does not wire it twice", async () => {
		const button = render();

		initMenu();
		expect(button.dataset.menuInitialized).toBe("true");

		initMenu();
		button.click();
		await vi.dynamicImportSettled();

		expect(button.getAttribute("aria-expanded")).toBe("true");
	});

	it("makes what the menu covers inert while it is open", async () => {
		const button = render();

		initMenu();
		button.click();

		expect((document.querySelector("main") as HTMLElement).inert).toBe(true);

		button.click();
		await vi.dynamicImportSettled();

		expect((document.querySelector("main") as HTMLElement).inert).toBe(false);
	});

	it("closes on Escape once it is open, and ignores it while it is closed", async () => {
		const button = render();
		initMenu();

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(false);

		button.click();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		await vi.dynamicImportSettled();

		expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(false);
	});
});
