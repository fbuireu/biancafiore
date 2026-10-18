import { runInNewContext } from "node:vm";
import { articleHref } from "@const/routes";
import { ARTICLE_FEATURED_IMAGE_CLASS, ARTICLE_MASTHEAD_CLASS } from "@modules/article/const";
import { afterEach, describe, expect, it } from "vitest";
import {
	ARTICLE_CARD_FEATURED_IMAGE_CLASS,
	ARTICLE_CARD_LINK_CLASS,
	ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE,
} from "../../articleCard/const";
import { featuredImageTransitionName } from "../../blurImage/utils/transition";
import { FEATURED_IMAGE_TRANSITION_SCRIPT } from "./transition";

const SLUGS = ["first", "second"];
const OWN_SLUG = "own";
const VIEW_TRANSITION_NAME = "view-transition-name";

interface Activation {
	navigationType: string;
	from?: { url: string };
	entry?: { url: string };
}

interface ViewTransitionDouble {
	skipped: boolean;
	skipTransition: () => void;
}

const urlOf = (slug: string): string => new URL(articleHref(slug), location.href).href;

const nameOf = (slug: string): string =>
	(
		document.querySelector(
			`[${ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE}="${featuredImageTransitionName(slug)}"]`,
		) as HTMLElement
	).style.getPropertyValue(VIEW_TRANSITION_NAME);

const inlineNameOf = (selector: string): string =>
	(document.querySelector(selector) as HTMLElement).style.getPropertyValue(VIEW_TRANSITION_NAME);

const mastheadName = (): string => inlineNameOf(`.${ARTICLE_MASTHEAD_CLASS}`);
const heroName = (): string => inlineNameOf(`.${ARTICLE_FEATURED_IMAGE_CLASS}`);

const boot = (activation?: Activation): EventTarget => {
	const page = new EventTarget();

	document.body.innerHTML = `
		<img class="${ARTICLE_FEATURED_IMAGE_CLASS}" style="${VIEW_TRANSITION_NAME}: ${featuredImageTransitionName(OWN_SLUG)}">
		<div class="${ARTICLE_MASTHEAD_CLASS}"></div>
		<ul>${SLUGS.map(
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

const fire = ({ page, type, activation, hasViewTransition = true }: FireParams): ViewTransitionDouble => {
	const viewTransition: ViewTransitionDouble = {
		skipped: false,
		skipTransition() {
			this.skipped = true;
		},
	};

	page.dispatchEvent(
		Object.assign(new Event(type), { activation, viewTransition: hasViewTransition ? viewTransition : null }),
	);

	return viewTransition;
};

interface LeaveForParams {
	page: EventTarget;
	slug: string;
}

const leaveFor = ({ page, slug }: LeaveForParams): ViewTransitionDouble =>
	fire({ page, type: "pageswap", activation: { navigationType: "push", entry: { url: urlOf(slug) } } });

afterEach(() => {
	document.body.innerHTML = "";
});

describe("FEATURED_IMAGE_TRANSITION_SCRIPT", () => {
	it("names, as the reader leaves, the image of the card that links where they are going", () => {
		const page = boot();

		const transition = leaveFor({ page, slug: "second" });

		expect(SLUGS.map(nameOf)).toEqual(["", featuredImageTransitionName("second")]);
		expect(transition.skipped).toBe(false);
	});

	it("holds back the page's own masthead and featured image as the reader leaves forward, so neither ghosts over the next page", () => {
		const page = boot();

		leaveFor({ page, slug: "second" });

		expect(mastheadName()).toBe("none");
		expect(heroName()).toBe("none");
	});

	it("skips the transition as the reader leaves for a page no card links to, since nothing would morph", () => {
		const page = boot();

		const transition = fire({
			page,
			type: "pageswap",
			activation: { navigationType: "push", entry: { url: new URL("/tags/anything", location.href).href } },
		});

		expect(transition.skipped).toBe(true);
		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
	});

	it("names no card as the reader traverses away, and keeps the featured image named for the card it returns to", () => {
		const page = boot();

		const transition = fire({
			page,
			type: "pageswap",
			activation: { navigationType: "traverse", entry: { url: urlOf("second") } },
		});

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
		expect(heroName()).toBe(featuredImageTransitionName(OWN_SLUG));
		expect(mastheadName()).toBe("none");
		expect(transition.skipped).toBe(false);
	});

	it("names and holds nothing when the browser runs no view transition, so a reduced-motion reader pays for no layer", () => {
		const page = boot();

		fire({
			page,
			type: "pageswap",
			activation: { navigationType: "push", entry: { url: urlOf("first") } },
			hasViewTransition: false,
		});

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
		expect(mastheadName()).toBe("");
		expect(heroName()).toBe(featuredImageTransitionName(OWN_SLUG));
	});

	it("gives back, when the back/forward cache restores the page, the names it held back as the reader left", () => {
		const page = boot({ navigationType: "traverse", from: { url: urlOf("first") } });

		leaveFor({ page, slug: "second" });
		fire({ page, type: "pagereveal" });

		expect(mastheadName()).toBe("");
		expect(heroName()).toBe(featuredImageTransitionName(OWN_SLUG));
	});

	it("names, on the way back, the card of the revealed page that links to the Article the reader left", () => {
		const page = boot({ navigationType: "traverse", from: { url: urlOf("first") } });

		const transition = fire({ page, type: "pagereveal" });

		expect(SLUGS.map(nameOf)).toEqual([featuredImageTransitionName("first"), ""]);
		expect(transition.skipped).toBe(false);
	});

	it("skips the transition on the way back to a page with no card for the Article the reader left", () => {
		const page = boot({ navigationType: "traverse", from: { url: new URL("/tags/anything", location.href).href } });

		const transition = fire({ page, type: "pagereveal" });

		expect(transition.skipped).toBe(true);
	});

	it("unnames the card it named before, since a page the back/forward cache restores keeps the name it was left with", () => {
		const page = boot();

		leaveFor({ page, slug: "second" });
		leaveFor({ page, slug: "first" });

		expect(SLUGS.map(nameOf)).toEqual([featuredImageTransitionName("first"), ""]);
	});

	it("unnames every card as the reader leaves for a page no card links to", () => {
		const page = boot();

		leaveFor({ page, slug: "second" });
		fire({ page, type: "pageswap", activation: { navigationType: "traverse", entry: { url: urlOf("second") } } });

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
	});

	it("unnames, on the way back, the card the page was left with before naming the one the reader comes back from", () => {
		const page = boot({ navigationType: "traverse", from: { url: urlOf("first") } });

		leaveFor({ page, slug: "second" });
		fire({ page, type: "pagereveal" });

		expect(SLUGS.map(nameOf)).toEqual([featuredImageTransitionName("first"), ""]);
	});

	it("names no card of a page reached forward, or the image the reader left would fly to a Related Article", () => {
		const page = boot({ navigationType: "push", from: { url: urlOf("first") } });

		const transition = fire({ page, type: "pagereveal" });

		expect(SLUGS.map(nameOf)).toEqual(["", ""]);
		expect(transition.skipped).toBe(false);
	});
});
