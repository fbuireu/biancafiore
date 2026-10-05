import { ARTICLE_BODY_CLASS } from "../../../const";
import { READING_PROGRESS_CLASS } from "../const";

const SELECTORS = {
	ARTICLE: `.${ARTICLE_BODY_CLASS}`,
	PROGRESS_BAR: `.${READING_PROGRESS_CLASS}`,
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
