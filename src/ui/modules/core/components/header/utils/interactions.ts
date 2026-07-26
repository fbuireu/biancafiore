import { gsap, Power2, Power3, Power4 } from "gsap";

const BACKGROUND_OBSERVER_SELECTORS = {
	HEADER: ".header",
	DARK_SECTION: ".blog, .latest-articles-wrapper",
	HEADER_MENU_BUTTON: ".header__menu-button",
	HEADER_MENU_LOGO: ".site__logo svg",
	FOOTER: "footer",
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

const isIntersecting = (element: HTMLElement): boolean => {
	const { HEADER: HEADER_SELECTOR } = BACKGROUND_OBSERVER_SELECTORS;
	const headerOffsetHeight = (document.querySelector(HEADER_SELECTOR) as HTMLElement).offsetHeight / 2;
	const threshold = element.offsetTop - headerOffsetHeight;
	const sectionBottom = element.offsetTop + element.offsetHeight - headerOffsetHeight;

	return window.scrollY >= threshold && window.scrollY < sectionBottom;
};

export function backgroundObserver(): void {
	const {
		HEADER: HEADER_SELECTOR,
		DARK_SECTION: DARK_SECTION_SELECTOR,
		HEADER_MENU_BUTTON: HEADER_MENU_BUTTON_SELECTOR,
		HEADER_MENU_LOGO: HEADER_MENU_LOGO_SELECTOR,
		FOOTER: FOOTER_SELECTOR,
	} = BACKGROUND_OBSERVER_SELECTORS;

	const HEADER = document.querySelector(HEADER_SELECTOR) as HTMLElement;
	const DARK_SECTION = document.querySelector(DARK_SECTION_SELECTOR) as HTMLElement;
	const HEADER_MENU_BUTTON = document.querySelector(HEADER_MENU_BUTTON_SELECTOR) as unknown as HTMLElement;
	const HEADER_MENU_LOGO = document.querySelector(HEADER_MENU_LOGO_SELECTOR) as unknown as HTMLElement;
	const FOOTER = document.querySelector(FOOTER_SELECTOR) as unknown as HTMLElement;
	const isMenuOpen = document.documentElement.classList.contains(MENU_OPEN_CLASS);

	if (!HEADER || !DARK_SECTION || isMenuOpen) {
		return;
	}

	const hasIntersected = isIntersecting(DARK_SECTION) || isIntersecting(FOOTER);

	HEADER_MENU_BUTTON.classList.toggle("header__menu-button--intersected", hasIntersected);
	HEADER_MENU_LOGO.classList.toggle("logo--intersected", hasIntersected);
}

window.addEventListener("scroll", backgroundObserver);

export function toggleMenu(): void {
	const {
		HTML: HTML_SELECTOR,
		TOGGLE_MENU_BUTTON: TOGGLE_MENU_BUTTON_SELECTOR,
		MENU_OVERLAY,
		OVERLAY_PATH,
		BUTTON_OUTLINE,
		HEADER_MENU,
		NAVIGATION_ITEMS,
		QUOTE,
		HEADER_MENU_TEXT,
		FIRST_MENU_LINK: FIRST_MENU_LINK_SELECTOR,
	} = TOGGLE_MENU_SELECTORS;

	const HTML = document.querySelector(HTML_SELECTOR) as HTMLHtmlElement;
	const TOGGLE_MENU_BUTTON = document.querySelector(TOGGLE_MENU_BUTTON_SELECTOR) as HTMLElement;
	const MENU_TEXT = document.querySelector(HEADER_MENU_TEXT) as HTMLElement;

	if (!TOGGLE_MENU_BUTTON || TOGGLE_MENU_BUTTON.dataset.menuInitialized === "true") {
		return;
	}

	TOGGLE_MENU_BUTTON.dataset.menuInitialized = "true";

	let isMenuOpen = false;
	let toggleMenuText = "Menu";
	const timeline = gsap.timeline({ paused: true });
	timeline.eventCallback("onReverseComplete", () => backgroundObserver());

	HTML.classList.remove(MENU_OPEN_CLASS);
	HTML.style.overflow = "";

	const toggleMenuItems = (): void => {
		const { POWER4_IN_OUT, POWER2_EASE_IN, POWER2_EASE_OUT, POWER3_OUT, PATH_START, PATH_END } =
			TOGGLE_MENU_ANIMATION_CONFIG;

		timeline.to(MENU_OVERLAY, { display: "block" });
		timeline.to(
			MENU_TEXT,
			{
				top: "1.75rem",
				left: "1.25rem",
				fontSize: "1.5rem",
				x: "-1rem",
				y: 0,
				ease: POWER4_IN_OUT,
				duration: 1,
			},
			"<",
		);
		timeline.add(() => updateButton(), "<");
		timeline.to(
			BUTTON_OUTLINE,
			{
				width: "90px",
				height: "90px",
				x: "-1rem",
				y: 0,
				ease: POWER4_IN_OUT,
				duration: 1,
			},
			"<",
		);
		timeline
			.to(OVERLAY_PATH, { attr: { d: PATH_START }, ease: POWER2_EASE_IN, duration: 1 }, "<")
			.to(OVERLAY_PATH, { attr: { d: PATH_END }, ease: POWER2_EASE_OUT, duration: 1 }, "-=0.5");
		timeline.to(HEADER_MENU, { visibility: "visible", duration: 1 }, "-=0.5");
		timeline
			.to(
				NAVIGATION_ITEMS,
				{
					top: 0,
					ease: POWER3_OUT,
					stagger: { amount: 0.5 },
					duration: 0.75,
				},
				"<",
			)
			.reverse();
		timeline.to(
			QUOTE,
			{
				top: 0,
				ease: POWER3_OUT,
				duration: 0.75,
			},
			"<",
		);
	};

	toggleMenuItems();

	const updateButton = (): void => {
		if (!MENU_TEXT) return;

		toggleMenuText = isMenuOpen ? "Close" : "Menu";
		const timeout = isMenuOpen ? 500 : 0;

		document.documentElement.style.overflow = isMenuOpen ? "hidden" : "initial";

		setTimeout(() => {
			MENU_TEXT.textContent = toggleMenuText;
		}, timeout);
	};

	const closeMenuAndFocusButton = (): void => {
		TOGGLE_MENU_BUTTON.click();
		TOGGLE_MENU_BUTTON.focus();
	};

	TOGGLE_MENU_BUTTON.addEventListener("click", () => {
		isMenuOpen = !isMenuOpen;
		timeline.reversed(!timeline.reversed());
		TOGGLE_MENU_BUTTON.setAttribute("aria-expanded", String(isMenuOpen));

		HTML.classList.toggle(MENU_OPEN_CLASS, isMenuOpen);

		if (isMenuOpen) {
			const FIRST_MENU_LINK = document.querySelector(FIRST_MENU_LINK_SELECTOR) as HTMLElement;
			FIRST_MENU_LINK?.focus();
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape" || !isMenuOpen) {
			return;
		}

		closeMenuAndFocusButton();
	});
}
