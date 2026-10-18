import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from "astro:transitions/client";
import {
	ARTICLE_CARD_FEATURED_IMAGE_CLASS,
	ARTICLE_CARD_LINK_CLASS,
	ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE,
} from "../const";

const SELECTORS = {
	LINK: `.${ARTICLE_CARD_LINK_CLASS}`,
	FEATURED_IMAGE: `.${ARTICLE_CARD_FEATURED_IMAGE_CLASS}`,
} as const;

const TRAVERSE = "traverse";

const VIEW_TRANSITION_NAME = "view-transition-name";

let transitionListeners: AbortController | undefined;

function nameFeaturedImage(link: Element): void {
	const image = link.parentElement?.querySelector<HTMLElement>(SELECTORS.FEATURED_IMAGE);
	const name = image?.getAttribute(ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE);

	if (image && name) image.style.setProperty(VIEW_TRANSITION_NAME, name);
}

function nameClickedCard({ sourceElement }: TransitionBeforePreparationEvent): void {
	const link = sourceElement?.closest(SELECTORS.LINK);

	if (link) nameFeaturedImage(link);
}

function nameCardLeftFor({ from, navigationType, newDocument }: TransitionBeforeSwapEvent): void {
	if (navigationType !== TRAVERSE) return;

	const link = [...newDocument.querySelectorAll(SELECTORS.LINK)].find(
		(candidate) => new URL(candidate.getAttribute("href") ?? "", from).pathname === from.pathname,
	);

	if (link) nameFeaturedImage(link);
}

export function wireFeaturedImageTransition(signal: AbortSignal): void {
	document.addEventListener("astro:before-preparation", nameClickedCard, { signal });
	document.addEventListener("astro:before-swap", nameCardLeftFor, { signal });
}

export function initFeaturedImageTransition(): void {
	transitionListeners?.abort();
	transitionListeners = new AbortController();

	wireFeaturedImageTransition(transitionListeners.signal);
}
