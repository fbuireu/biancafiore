const SELECTORS = {
	HEADER: ".header",
	LATEST_ARTICLES: ".latest-articles__wrapper",
	SITE_LOGO: ".site__logo",
	HEADER_MENU_BUTTON: ".header__menu-button",
};

function isIntersecting(element: HTMLElement): boolean {
	const { HEADER: HEADER_SELECTOR } = SELECTORS;
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
		HEADER_MENU_BUTTON: HEADER_MENU_BUTTON_SELECTOR,
	} = SELECTORS;

	const HEADER = document.querySelector(HEADER_SELECTOR) as HTMLElement;
	const LATEST_ARTICLES = document.querySelector(LATEST_ARTICLES_SELECTOR) as HTMLElement;
	const SITE_LOGO = document.querySelector(SITE_LOGO_SELECTOR) as HTMLElement;
	const HEADER_MENU_BUTTON = document.querySelector(HEADER_MENU_BUTTON_SELECTOR) as unknown as HTMLElement;
	const isMenuOpen = SITE_LOGO.classList.contains("--is-menu-open");

	if (!HEADER || !LATEST_ARTICLES || isMenuOpen) return;

	const hasIntersected = isIntersecting(LATEST_ARTICLES);

	HEADER_MENU_BUTTON.classList.toggle("--has-intersected", hasIntersected);
}

window.addEventListener("scroll", backgroundObserver);
