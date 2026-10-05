import { motionTimeScale } from "../../../utils/motion";
import { LOGO_INTERSECTED_CLASS, LOGO_LINK_CLASS } from "../../logo/const";
import { SCROLL_TOP_WRAPPER_CLASS } from "../../scrollTop/const";
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

const BACKGROUND_OBSERVER_SELECTORS = {
	HEADER: `.${HEADER_CLASS}`,
	INVERTED_SECTION: ".inverted-color-scheme",
	HEADER_MENU_BUTTON: `.${HEADER_MENU_BUTTON_CLASS}`,
	HEADER_MENU_LOGO: `.${LOGO_LINK_CLASS} svg`,
};
const INTERSECTED_CLASSES = {
	HEADER_MENU_BUTTON: HEADER_MENU_BUTTON_INTERSECTED_CLASS,
	HEADER_MENU_LOGO: LOGO_INTERSECTED_CLASS,
};
const TOGGLE_MENU_ANIMATION_CONFIG = {
	POWER4_IN_OUT: "power4.inOut",
	POWER2_EASE_OUT: "power2.out",
	POWER2_EASE_IN: "power2.in",
	POWER3_OUT: "power3.out",
	PATH_START: "M0 502S175 272 500 272s500 230 500 230V0H0Z",
	PATH_END: "M0,1005S175,995,500,995s500,5,500,5V0H0Z",
};
const TOGGLE_MENU_SELECTORS = {
	HTML: "html",
	TOGGLE_MENU_BUTTON: `.${HEADER_MENU_BUTTON_CLASS}`,
	MENU_OVERLAY: `.${HEADER_MENU_OVERLAY_CLASS}`,
	OVERLAY_PATH: `.${HEADER_MENU_OVERLAY_CLASS} path`,
	HEADER_MENU_TEXT: `.${HEADER_MENU_TEXT_CLASS}`,
	BUTTON_OUTLINE: `.${HEADER_MENU_BUTTON_OUTLINE_CLASS}`,
	HEADER_MENU: `.${HEADER_MENU_CLASS}`,
	NAVIGATION_ITEMS: `.${HEADER_MENU_ITEM_CLASS} > *`,
	QUOTE: `.${HEADER_MENU_QUOTE_CLASS} > *`,
	FIRST_MENU_LINK: `.${HEADER_MENU_NAV_CLASS} a`,
	COVERED_BY_MENU: `main, footer, .${SCROLL_TOP_WRAPPER_CLASS}`,
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

interface MenuTimeline {
	reversed(value?: boolean): unknown;
	eventCallback(type: "onComplete", callback: () => void): unknown;
}

interface MenuElements {
	html: HTMLElement;
	button: HTMLElement;
	text: HTMLElement | null;
}

interface WireMenuParams {
	elements: MenuElements;
	signal: AbortSignal;
	buildTimeline?: (onButtonUpdate: () => void) => Promise<MenuTimeline>;
}

const MENU_TEXT_LABEL = { OPEN: "Close", CLOSED: "Menu" } as const;
const CLOSE_LABEL_DELAY = 500;

async function buildMenuTimeline(onButtonUpdate: () => void): Promise<MenuTimeline> {
	const { gsap } = await import("gsap");
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

	return {
		reversed: (value) => timeline.reversed(value as boolean),
		eventCallback: (type, callback) => timeline.eventCallback(type, callback),
	};
}

const setInert = (isMenuOpen: boolean): void => {
	for (const region of document.querySelectorAll<HTMLElement>(TOGGLE_MENU_SELECTORS.COVERED_BY_MENU)) {
		region.inert = isMenuOpen;
	}
};

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

	let timeline: Promise<MenuTimeline> | undefined;

	const loadTimeline = (): Promise<MenuTimeline> => {
		timeline ??= buildTimeline(updateButton).then((built) => {
			built.eventCallback("onComplete", () => {
				document.querySelector<HTMLElement>(TOGGLE_MENU_SELECTORS.FIRST_MENU_LINK)?.focus();
			});

			return built;
		});

		return timeline;
	};

	html.classList.remove(MENU_OPEN_CLASS);
	html.style.overflow = "";

	button.addEventListener(
		"click",
		async () => {
			isMenuOpen = !isMenuOpen;
			button.setAttribute("aria-expanded", String(isMenuOpen));
			html.classList.toggle(MENU_OPEN_CLASS, isMenuOpen);

			setInert(isMenuOpen);

			(await loadTimeline()).reversed(!isMenuOpen);
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
