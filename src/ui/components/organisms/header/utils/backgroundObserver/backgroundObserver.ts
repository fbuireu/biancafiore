const SELECTORS = {
	HEADER: ".header",
	LATEST_ARTICLES: ".latest-articles__wrapper",
	SITE_LOGO_SVG: ".site__logo svg",
	SITE_LOGO: ".site__logo",
	HEADER_MENU_TEXT: ".header__menu-text",
	HEADER_MENU_BUTTON: ".header__menu-button ",
	HEADER_MENU_OUTLINES: ".header__menu-button__outline",
};

function isIntersecting(element: HTMLElement): boolean {
	const { HEADER: HEADER_SELECTOR, HEADER_MENU_BUTTON } = SELECTORS;
	const headerOffsetHeight = (document.querySelector(HEADER_SELECTOR) as HTMLElement).offsetHeight / 2;
	const threshold = element.offsetTop - headerOffsetHeight;
	const sectionBottom = element.offsetTop + element.offsetHeight - headerOffsetHeight;

	return window.scrollY >= threshold && window.scrollY < sectionBottom;
}

export function backgroundObserver(): void {
	const {
		HEADER: HEADER_SELECTOR,
		LATEST_ARTICLES: LATEST_ARTICLES_SELECTOR,
		SITE_LOGO: SITE_LOGO_SELECTOR,
		SITE_LOGO_SVG: SITE_LOGO_SVG_SELECTOR,
		HEADER_MENU_TEXT: HEADER_MENU_TEXT_SELECTOR,
		HEADER_MENU_OUTLINES: HEADER_MENU_OUTLINES_SELECTOR,
	} = SELECTORS;

	const HEADER = document.querySelector(HEADER_SELECTOR) as HTMLElement;
	const LATEST_ARTICLES = document.querySelector(LATEST_ARTICLES_SELECTOR) as HTMLElement;
	const SITE_LOGO_SVG = document.querySelector(SITE_LOGO_SVG_SELECTOR) as HTMLElement;
	const SITE_LOGO = document.querySelector(SITE_LOGO_SELECTOR) as HTMLElement;
	const HEADER_MENU_TEXT = document.querySelector(HEADER_MENU_TEXT_SELECTOR) as HTMLElement;
	const HEADER_MENU_OUTLINES = document.querySelectorAll(HEADER_MENU_OUTLINES_SELECTOR) as unknown as HTMLElement[];
	const isMenuOpen = SITE_LOGO.classList.contains("--is-menu-open");

	if (!HEADER || !LATEST_ARTICLES || isMenuOpen) return;
	const hasIntersected = isIntersecting(LATEST_ARTICLES);

	HEADER_MENU_OUTLINES.forEach((element) => element.classList.toggle("--has-intersected", hasIntersected));
	HEADER_MENU_TEXT.classList.toggle("--has-intersected", hasIntersected);
	SITE_LOGO_SVG.classList.toggle("--has-intersected", hasIntersected);
}

window.addEventListener("scroll", backgroundObserver);
