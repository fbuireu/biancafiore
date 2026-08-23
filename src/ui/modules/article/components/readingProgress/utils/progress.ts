const SELECTORS = {
	ARTICLE: ".article-wrapper",
	PROGRESS_BAR: ".reading-progress",
};

function paintReadingProgress(): void {
	const article = document.querySelector<HTMLElement>(SELECTORS.ARTICLE);
	const progressBar = document.querySelector<HTMLElement>(SELECTORS.PROGRESS_BAR);

	if (!article || !progressBar) {
		return;
	}

	const readingProgress = Math.min(Math.ceil((window.scrollY / article.offsetHeight) * 100), 100);

	progressBar.style.width = `${readingProgress}%`;
}

export function initReadingProgress(): void {
	window.addEventListener("scroll", paintReadingProgress, { passive: true });
	paintReadingProgress();
}
