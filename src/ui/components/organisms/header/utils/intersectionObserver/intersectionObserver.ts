export function intersectionObserver(): void {
    function handleScroll() {
        let hasIntersected = false;
        const WHITE = getComputedStyle(document.documentElement).getPropertyValue('--white');
        const BLACK = getComputedStyle(document.documentElement).getPropertyValue("--neutral-main'");
        const HEADER = document.querySelector('.header') as HTMLElement;
        const LATEST_ARTICLES = document.querySelector('.latest-articles__wrapper') as HTMLElement;
        const SITE_LOGO_SVG = document.querySelector('.site__logo svg') as HTMLElement;
        const HEADER_MENU_TEXT = document.querySelector('.header__menu-text') as HTMLElement;
        const HEADER_MENU_OUTLINES = document.querySelectorAll(
            '.header__menu-button__outline'
        ) as unknown as HTMLElement[];
        const ELEMENTS_TO_INTERSECT: HTMLElement[] = [LATEST_ARTICLES];

        if (!HEADER || !LATEST_ARTICLES) return;

        ELEMENTS_TO_INTERSECT.forEach(({ offsetTop, offsetHeight }) => {
            const headerOffsetHeight = HEADER.offsetHeight / 2;
            const threshold = offsetTop - headerOffsetHeight;
            const sectionBottom = offsetTop + offsetHeight - headerOffsetHeight;

            if (window.scrollY >= threshold && window.scrollY < sectionBottom) hasIntersected = true;
        });

        if (hasIntersected) {
            HEADER.classList.add('--hue-change');
            SITE_LOGO_SVG.style.fill = WHITE;
            HEADER_MENU_TEXT.style.color = WHITE;
            HEADER_MENU_OUTLINES.forEach((element) => (element.style.borderColor = WHITE));
        } else {
            HEADER.classList.remove('--hue-change');
            SITE_LOGO_SVG.style.fill = BLACK;
            HEADER_MENU_TEXT.style.color = BLACK;
            HEADER_MENU_OUTLINES.forEach((element) => (element.style.borderColor = BLACK));
        }
    }

    window.addEventListener('scroll', handleScroll);
}
