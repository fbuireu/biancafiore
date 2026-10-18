import { ARTICLE_FEATURED_IMAGE_CLASS, ARTICLE_MASTHEAD_CLASS } from "@modules/article/const";
import {
	ARTICLE_CARD_FEATURED_IMAGE_CLASS,
	ARTICLE_CARD_LINK_CLASS,
	ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE,
} from "../../articleCard/const";

const HELD_TRANSITION_NAME_ATTRIBUTE = "data-held-transition-name";

const literal = (value: string): string => JSON.stringify(value);

export const FEATURED_IMAGE_TRANSITION_SCRIPT = `(() => {
	const FEATURED_IMAGE = ${literal(`.${ARTICLE_CARD_FEATURED_IMAGE_CLASS}`)};
	const HELD = ${literal(HELD_TRANSITION_NAME_ATTRIBUTE)};
	const cardLinkingTo = (url) => {
		const { pathname } = new URL(url);

		return [...document.querySelectorAll(${literal(`.${ARTICLE_CARD_LINK_CLASS}`)})].find((link) => new URL(link.href).pathname === pathname);
	};
	const unname = () => {
		for (const image of document.querySelectorAll(FEATURED_IMAGE)) image.style.removeProperty("view-transition-name");
	};
	const name = (link) => {
		const image = link?.parentElement?.querySelector(FEATURED_IMAGE);
		const value = image?.getAttribute(${literal(ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE)});

		if (!image || !value) return false;
		image.style.setProperty("view-transition-name", value);

		return true;
	};
	const hold = (selector) => {
		const element = document.querySelector(selector);

		if (!element || element.hasAttribute(HELD)) return;
		element.setAttribute(HELD, element.style.getPropertyValue("view-transition-name"));
		element.style.setProperty("view-transition-name", "none");
	};
	const release = () => {
		for (const element of document.querySelectorAll("[" + HELD + "]")) {
			const value = element.getAttribute(HELD);

			if (value) element.style.setProperty("view-transition-name", value);
			else element.style.removeProperty("view-transition-name");
			element.removeAttribute(HELD);
		}
	};

	addEventListener("pageswap", ({ activation, viewTransition }) => {
		unname();
		if (!viewTransition || !activation) return;
		hold(${literal(`.${ARTICLE_MASTHEAD_CLASS}`)});
		if (activation.navigationType === "traverse") return;
		hold(${literal(`.${ARTICLE_FEATURED_IMAGE_CLASS}`)});
		if (!name(cardLinkingTo(activation.entry.url))) viewTransition.skipTransition();
	});
	addEventListener("pagereveal", ({ viewTransition }) => {
		const activation = navigation.activation;

		unname();
		release();
		if (!viewTransition || activation?.navigationType !== "traverse") return;
		if (!activation.from || !name(cardLinkingTo(activation.from.url))) viewTransition.skipTransition();
	});
})();`;
