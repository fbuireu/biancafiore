import {
	ARTICLE_CARD_FEATURED_IMAGE_CLASS,
	ARTICLE_CARD_LINK_CLASS,
	ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE,
} from "../../articleCard/const";

const literal = (value: string): string => JSON.stringify(value);

export const FEATURED_IMAGE_TRANSITION_SCRIPT = `(() => {
	const cardLinkingTo = (url) => {
		const { pathname } = new URL(url);

		return [...document.querySelectorAll(${literal(`.${ARTICLE_CARD_LINK_CLASS}`)})].find((link) => new URL(link.href).pathname === pathname);
	};
	const name = (link) => {
		const image = link?.parentElement?.querySelector(${literal(`.${ARTICLE_CARD_FEATURED_IMAGE_CLASS}`)});
		const value = image?.getAttribute(${literal(ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE)});

		if (image && value) image.style.setProperty("view-transition-name", value);
	};

	addEventListener("pageswap", ({ activation, viewTransition }) => {
		if (viewTransition && activation && activation.navigationType !== "traverse") name(cardLinkingTo(activation.entry.url));
	});
	addEventListener("pagereveal", ({ viewTransition }) => {
		const activation = navigation.activation;

		if (viewTransition && activation?.from && activation.navigationType === "traverse") name(cardLinkingTo(activation.from.url));
	});
})();`;
