const SELECTORS = {
	ARTICLE: ".article-wrapper",
	PROGRESS_BAR: ".reading-progress",
};

export function getReadingProgress(): void {
	const ARTICLE = document.querySelector(SELECTORS.ARTICLE) as HTMLElement;
	const PROGRESS_BAR = document.querySelector(SELECTORS.PROGRESS_BAR) as HTMLElement;

	if (!ARTICLE || !PROGRESS_BAR) {
		return;
	}

	const readingProgress = Math.min(Math.ceil((window.scrollY / ARTICLE.offsetHeight) * 100), 100);

	PROGRESS_BAR.style.width = `${readingProgress}%`;
}
