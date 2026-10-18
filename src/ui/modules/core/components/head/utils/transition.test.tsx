import { runInNewContext } from "node:vm";
import { articleHref } from "@const/routes";
import { afterEach, describe, expect, it } from "vitest";
import {
	ARTICLE_CARD_FEATURED_IMAGE_CLASS,
	ARTICLE_CARD_LINK_CLASS,
	ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE,
} from "../../articleCard/const";
import { featuredImageTransitionName } from "../../blurImage/utils/transition";
import { FEATURED_IMAGE_TRANSITION_SCRIPT } from "./transition";

const SLUGS = ["first", "second"];
const VIEW_TRANSITION_NAME = "view-transition-name";

interface Activation {
	navigationType: string;
	from?: { url: string };
	entry?: { url: string };
}

const urlOf = (slug: string): string => new URL(articleHref(slug), location.href).href;

const nameOf = (slug: string): string =>
	(
		document.querySelector(
			`[${ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE}="${featuredImageTransitionName(slug)}"]`,
		) as HTMLElement
	).style.getPropertyValue(VIEW_TRANSITION_NAME);

const boot = (activation?: Activation): EventTarget => {
	const page = new EventTarget();

	document.body.innerHTML = `<ul>${SLUGS.map(
		(slug) => `
		<li>
			<a class="${ARTICLE_CARD_LINK_CLASS}" href="${articleHref(slug)}"> </a>
			<article><img class="${ARTICLE_CARD_FEATURED_IMAGE_CLASS}" ${ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE}="${featuredImageTransitionName(slug)}"></article>
		</li>`,
	).join("")}</ul>`;
	runInNewContext(FEATURED_IMAGE_TRANSITION_SCRIPT, {
		addEventListener: page.addEventListener.bind(page),
		document,
		navigation: { activation },
		URL,
	});

	return page;
};

interface FireParams {
	page: EventTarget;
	type: "pageswap" | "pagereveal";
	activation?: Activation;
	hasViewTransition?: boolean;
}

const fire = ({ page, type, activation, hasViewTransition = true }: FireParams): void => {
	page.dispatchEvent(Object.assign(new Event(type), { activation, viewTransition: hasViewTransition ? {} : null }));
};

afterEach(() => {
	document.body.innerHTML = "";
});

describe("FEATURED_IMAGE_TRANSITION_SCRIPT", () => {
	it("names, as the reader leaves, the image of the card that links where they are going", () => {
		const page = boot();

		fire({ page, type: "pageswap", activation: { navigationType: "push", entry: { url: urlOf("second") } } });

		expect(SLUGS.map(nameOf)).toEqual(["", featuredImageTransitionName("second")]);
	});

	it("names no card as the reader traverses away, since the page they return to names its own", () => {
		const page = boot();

		fire({ page, type: "pageswap", activation: { navigationType: "traverse", entry: { url: urlOf("second") } } });

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
	});

	it("names nothing when the browser runs no view transition, so a reduced-motion reader pays for no layer", () => {
		const page = boot();

		fire({
			page,
			type: "pageswap",
			activation: { navigationType: "push", entry: { url: urlOf("first") } },
			hasViewTransition: false,
		});

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
	});

	it("names, on the way back, the card of the revealed page that links to the Article the reader left", () => {
		const page = boot({ navigationType: "traverse", from: { url: urlOf("first") } });

		fire({ page, type: "pagereveal" });

		expect(SLUGS.map(nameOf)).toEqual([featuredImageTransitionName("first"), ""]);
	});

	it("names no card of a page reached forward, or the image the reader left would fly to a Related Article", () => {
		const page = boot({ navigationType: "push", from: { url: urlOf("first") } });

		fire({ page, type: "pagereveal" });

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
	});
});
