import { backgroundObserver } from "@modules/core/components/header/utils/interactions";
import { beforeEach, describe, expect, it } from "vitest";

const HEADER_HEIGHT = 80;
const HEADER_MIDLINE = HEADER_HEIGHT / 2;
const MENU_OPEN_CLASS = "page--menu-open";
const INTERSECTED_BUTTON_CLASS = "header__menu-button--intersected";
const INTERSECTED_LOGO_CLASS = "logo--intersected";

const place = ({ selector, top, height }: { selector: string; top: number; height: number }): void => {
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
