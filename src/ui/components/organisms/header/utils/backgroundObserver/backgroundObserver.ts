const SELECTORS = {
	HEADER: ".header",
	LATEST_ARTICLES: ".latest-articles__wrapper",
	SITE_LOGO_SVG: ".site__logo svg",
	SITE_LOGO: ".site__logo",
	HEADER_MENU_TEXT: ".header__menu-text",
	HEADER_MENU_OUTLINES: ".header__menu-button__outline",
};

function getComputedStyleValue(property: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(property);
}

function isIntersecting(element: HTMLElement): boolean {
	const { HEADER: HEADER_SELECTOR } = SELECTORS;
	const headerOffsetHeight =
		(document.querySelector(HEADER_SELECTOR) as HTMLElement).offsetHeight / 2;
	const threshold = element.offsetTop - headerOffsetHeight;
	const sectionBottom =
		element.offsetTop + element.offsetHeight - headerOffsetHeight;

	return window.scrollY >= threshold && window.scrollY < sectionBottom;
}

export function backgroundObserver(): void {
	const WHITE = getComputedStyleValue("--white");
	const BLACK = getComputedStyleValue("--neutral-main");
	const {
		HEADER: HEADER_SELECTOR,
		LATEST_ARTICLES: LATEST_ARTICLES_SELECTOR,
		SITE_LOGO: SITE_LOGO_SELECTOR,
		SITE_LOGO_SVG: SITE_LOGO_SVG_SELECTOR,
		HEADER_MENU_TEXT: HEADER_MENU_TEXT_SELECTOR,
		HEADER_MENU_OUTLINES: HEADER_MENU_OUTLINES_SELECTOR,
	} = SELECTORS;

	const HEADER = document.querySelector(HEADER_SELECTOR) as HTMLElement;
	const LATEST_ARTICLES = document.querySelector(
		LATEST_ARTICLES_SELECTOR,
	) as HTMLElement;
	const SITE_LOGO_SVG = document.querySelector(
		SITE_LOGO_SVG_SELECTOR,
	) as HTMLElement;
	const SITE_LOGO = document.querySelector(SITE_LOGO_SELECTOR) as HTMLElement;
	const HEADER_MENU_TEXT = document.querySelector(
		HEADER_MENU_TEXT_SELECTOR,
	) as HTMLElement;
	const HEADER_MENU_OUTLINES = document.querySelectorAll(
		HEADER_MENU_OUTLINES_SELECTOR,
	) as unknown as HTMLElement[];
	const isMenuOpen = SITE_LOGO.classList.contains("--is-menu-open");

	if (!HEADER || !LATEST_ARTICLES || isMenuOpen) return;
	const hasIntersected = isIntersecting(LATEST_ARTICLES);

	if (hasIntersected) {
		SITE_LOGO_SVG.style.fill = WHITE;
		HEADER_MENU_TEXT.style.color = WHITE;
		HEADER_MENU_OUTLINES.forEach(
			(element) => (element.style.borderColor = WHITE),
		);
	} else {
		SITE_LOGO_SVG.style.fill = BLACK;
		HEADER_MENU_TEXT.style.color = BLACK;
		HEADER_MENU_OUTLINES.forEach(
			(element) => (element.style.borderColor = BLACK),
		);
	}
}

window.addEventListener("scroll", backgroundObserver);
