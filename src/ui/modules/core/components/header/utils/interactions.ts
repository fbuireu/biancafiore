import { motionTimeScale } from "@modules/core/utils/motion";
import { gsap, Power2, Power3, Power4 } from "gsap";

const BACKGROUND_OBSERVER_SELECTORS = {
	HEADER: ".header",
	INVERTED_SECTION: ".inverted-color-scheme",
	HEADER_MENU_BUTTON: ".header__menu-button",
	HEADER_MENU_LOGO: ".site__logo svg",
};
const INTERSECTED_CLASSES = {
	HEADER_MENU_BUTTON: "header__menu-button--intersected",
	HEADER_MENU_LOGO: "logo--intersected",
};
const MENU_OPEN_CLASS = "page--menu-open";
const TOGGLE_MENU_ANIMATION_CONFIG = {
	POWER4_IN_OUT: Power4.easeInOut,
	POWER2_EASE_OUT: Power2.easeOut,
	POWER2_EASE_IN: Power2.easeIn,
	POWER3_OUT: Power3.easeOut,
	PATH_START: "M0 502S175 272 500 272s500 230 500 230V0H0Z",
	PATH_END: "M0,1005S175,995,500,995s500,5,500,5V0H0Z",
};
const TOGGLE_MENU_SELECTORS = {
	HTML: "html",
	TOGGLE_MENU_BUTTON: ".header__menu-button",
	MENU_OVERLAY: ".header__menu-overlay-wrapper",
	OVERLAY_PATH: ".header__menu-overlay-wrapper path",
	HEADER_MENU_TEXT: ".header__menu-text",
	BUTTON_OUTLINE: ".header__menu-button__outline",
	HEADER_MENU: ".header__menu",
	NAVIGATION_ITEMS: ".navigation__menu__item > *",
	QUOTE: ".navigation__menu__quote > *",
	FIRST_MENU_LINK: ".navigation__menu__nav a",
};

interface IsIntersectingParams {
	element: Element;
	midline: number;
}

const isIntersecting = ({ element, midline }: IsIntersectingParams): boolean => {
	const { top, bottom } = element.getBoundingClientRect();

	return midline >= top && midline < bottom;
};

export function backgroundObserver(): void {
	const {
		HEADER: HEADER_SELECTOR,
		INVERTED_SECTION: INVERTED_SECTION_SELECTOR,
		HEADER_MENU_BUTTON: HEADER_MENU_BUTTON_SELECTOR,
		HEADER_MENU_LOGO: HEADER_MENU_LOGO_SELECTOR,
	} = BACKGROUND_OBSERVER_SELECTORS;

	const HEADER = document.querySelector(HEADER_SELECTOR);
	const isMenuOpen = document.documentElement.classList.contains(MENU_OPEN_CLASS);

	if (!HEADER || isMenuOpen) {
		return;
	}

	const { top: headerTop, height: headerHeight } = HEADER.getBoundingClientRect();
	const midline = headerTop + headerHeight / 2;
	const INVERTED_SECTIONS = Array.from(document.querySelectorAll(INVERTED_SECTION_SELECTOR));
	const hasIntersected = INVERTED_SECTIONS.some((element) => isIntersecting({ element, midline }));

	document
		.querySelector(HEADER_MENU_BUTTON_SELECTOR)
		?.classList.toggle(INTERSECTED_CLASSES.HEADER_MENU_BUTTON, hasIntersected);
	document
		.querySelector(HEADER_MENU_LOGO_SELECTOR)
		?.classList.toggle(INTERSECTED_CLASSES.HEADER_MENU_LOGO, hasIntersected);
}

export function watchBackground(): void {
	window.addEventListener("scroll", backgroundObserver, { passive: true });
	backgroundObserver();
}

export interface MenuTimeline {
	reversed(value?: boolean): unknown;
}

export interface MenuElements {
	html: HTMLElement;
	button: HTMLElement;
	text: HTMLElement | null;
}

export interface WireMenuParams {
	elements: MenuElements;
	signal: AbortSignal;
	buildTimeline?: (onButtonUpdate: () => void) => MenuTimeline;
}

const MENU_TEXT_LABEL = { OPEN: "Close", CLOSED: "Menu" } as const;
const CLOSE_LABEL_DELAY = 500;

function buildMenuTimeline(onButtonUpdate: () => void): MenuTimeline {
	const { MENU_OVERLAY, OVERLAY_PATH, BUTTON_OUTLINE, HEADER_MENU, NAVIGATION_ITEMS, QUOTE, HEADER_MENU_TEXT } =
		TOGGLE_MENU_SELECTORS;
	const { POWER4_IN_OUT, POWER2_EASE_IN, POWER2_EASE_OUT, POWER3_OUT, PATH_START, PATH_END } =
		TOGGLE_MENU_ANIMATION_CONFIG;

	const timeline = gsap.timeline({ paused: true });

	timeline.timeScale(motionTimeScale());

	timeline.eventCallback("onReverseComplete", () => backgroundObserver());
	timeline.to(MENU_OVERLAY, { display: "block" });
	timeline.to(
		HEADER_MENU_TEXT,
		{ top: "1.75rem", left: "1.25rem", fontSize: "1.5rem", x: "-1rem", y: 0, ease: POWER4_IN_OUT, duration: 1 },
		"<",
	);
	timeline.add(() => onButtonUpdate(), "<");
	timeline.to(
		BUTTON_OUTLINE,
		{ width: "90px", height: "90px", x: "-1rem", y: 0, ease: POWER4_IN_OUT, duration: 1 },
		"<",
	);
	timeline
		.to(OVERLAY_PATH, { attr: { d: PATH_START }, ease: POWER2_EASE_IN, duration: 1 }, "<")
		.to(OVERLAY_PATH, { attr: { d: PATH_END }, ease: POWER2_EASE_OUT, duration: 1 }, "-=0.5");
	timeline.to(HEADER_MENU, { visibility: "visible", duration: 1 }, "-=0.5");
	timeline.to(NAVIGATION_ITEMS, { top: 0, ease: POWER3_OUT, stagger: { amount: 0.5 }, duration: 0.75 }, "<").reverse();
	timeline.to(QUOTE, { top: 0, ease: POWER3_OUT, duration: 0.75 }, "<");

	return timeline;
}

export function wireMenu({ elements, signal, buildTimeline = buildMenuTimeline }: WireMenuParams): void {
	const { html, button, text } = elements;

	let isMenuOpen = false;

	const updateButton = (): void => {
		if (!text) return;

		document.documentElement.style.overflow = isMenuOpen ? "hidden" : "initial";

		setTimeout(
			() => {
				text.textContent = isMenuOpen ? MENU_TEXT_LABEL.OPEN : MENU_TEXT_LABEL.CLOSED;
			},
			isMenuOpen ? CLOSE_LABEL_DELAY : 0,
		);
	};

	const timeline = buildTimeline(updateButton);

	html.classList.remove(MENU_OPEN_CLASS);
	html.style.overflow = "";

	button.addEventListener(
		"click",
		() => {
			isMenuOpen = !isMenuOpen;
			timeline.reversed(!timeline.reversed());
			button.setAttribute("aria-expanded", String(isMenuOpen));
			html.classList.toggle(MENU_OPEN_CLASS, isMenuOpen);

			if (isMenuOpen) {
				document.querySelector<HTMLElement>(TOGGLE_MENU_SELECTORS.FIRST_MENU_LINK)?.focus();
			}
		},
		{ signal },
	);

	document.addEventListener(
		"keydown",
		(event) => {
			if (event.key !== "Escape" || !isMenuOpen) return;

			button.click();
			button.focus();
		},
		{ signal },
	);
}

let menuListeners: AbortController | undefined;

export function initMenu(): void {
	const html = document.querySelector<HTMLElement>(TOGGLE_MENU_SELECTORS.HTML);
	const button = document.querySelector<HTMLElement>(TOGGLE_MENU_SELECTORS.TOGGLE_MENU_BUTTON);

	if (!html || !button || button.dataset.menuInitialized === "true") {
		return;
	}

	button.dataset.menuInitialized = "true";

	menuListeners?.abort();
	menuListeners = new AbortController();

	wireMenu({
		elements: { html, button, text: document.querySelector<HTMLElement>(TOGGLE_MENU_SELECTORS.HEADER_MENU_TEXT) },
		signal: menuListeners.signal,
	});
}
