import { articleHref } from "@const/routes";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { featuredImageTransitionName } from "../../blurImage/utils/transition";
import {
	ARTICLE_CARD_FEATURED_IMAGE_CLASS,
	ARTICLE_CARD_LINK_CLASS,
	ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE,
} from "../const";
import { initFeaturedImageTransition, wireFeaturedImageTransition } from "./interactions";

const SLUGS = ["first", "second"];
const VIEW_TRANSITION_NAME = "view-transition-name";

const cards = (slugs: string[]): string =>
	slugs
		.map(
			(slug) => `
			<li>
				<a class="${ARTICLE_CARD_LINK_CLASS}" href="${articleHref(slug)}"> </a>
				<article><img class="${ARTICLE_CARD_FEATURED_IMAGE_CLASS}" ${ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE}="${featuredImageTransitionName(slug)}"></article>
			</li>`,
		)
		.join("");

interface ImageOfParams {
	root: ParentNode;
	slug: string;
}

const imageOf = ({ root, slug }: ImageOfParams): HTMLElement =>
	root.querySelector<HTMLElement>(
		`[${ARTICLE_CARD_TRANSITION_NAME_ATTRIBUTE}="${featuredImageTransitionName(slug)}"]`,
	) as HTMLElement;

const nameOf = (image: HTMLElement): string => image.style.getPropertyValue(VIEW_TRANSITION_NAME);

const linkTo = (slug: string): HTMLElement =>
	document.querySelector<HTMLElement>(`.${ARTICLE_CARD_LINK_CLASS}[href="${articleHref(slug)}"]`) as HTMLElement;

const prepare = (sourceElement?: Element): void => {
	document.dispatchEvent(Object.assign(new Event("astro:before-preparation"), { sourceElement }));
};

interface SwapToParams {
	from: string;
	navigationType: string;
}

const swapTo = ({ from, navigationType }: SwapToParams): Document => {
	const newDocument = document.implementation.createHTMLDocument();
	newDocument.body.innerHTML = `<ul>${cards(SLUGS)}</ul>`;
	document.dispatchEvent(
		Object.assign(new Event("astro:before-swap"), {
			from: new URL(articleHref(from), location.href),
			navigationType,
			newDocument,
		}),
	);

	return newDocument;
};

describe("wireFeaturedImageTransition", () => {
	let controller: AbortController;
	let elsewhere: HTMLAnchorElement;

	beforeEach(() => {
		controller = new AbortController();
		document.body.innerHTML = `<ul>${cards(SLUGS)}</ul>`;
		elsewhere = document.createElement("a");
		elsewhere.href = "/";
		document.body.append(elsewhere);
		wireFeaturedImageTransition(controller.signal);
	});

	afterEach(() => {
		controller.abort();
		document.body.innerHTML = "";
	});

	it("names the featured image of the card the reader clicked, before the router captures the page", () => {
		prepare(linkTo("second"));

		expect(nameOf(imageOf({ root: document, slug: "second" }))).toBe(featuredImageTransitionName("second"));
	});

	it("leaves every other card unnamed, since the browser captures each named element as a layer of its own", () => {
		prepare(linkTo("second"));

		expect(nameOf(imageOf({ root: document, slug: "first" }))).toBe("");
	});

	it("names nothing when the navigation starts anywhere but a card", () => {
		prepare(elsewhere);
		prepare();

		expect(SLUGS.map((slug) => nameOf(imageOf({ root: document, slug })))).toEqual(["", ""]);
	});

	it("names, on the way back, the card of the incoming page that links to the Article the reader leaves, so its image lands there", () => {
		const newDocument = swapTo({ from: "first", navigationType: "traverse" });

		expect(nameOf(imageOf({ root: newDocument, slug: "first" }))).toBe(featuredImageTransitionName("first"));
		expect(nameOf(imageOf({ root: newDocument, slug: "second" }))).toBe("");
	});

	it("names no card of the incoming page on a forward navigation, so the image the reader leaves never flies to a Related Article", () => {
		const newDocument = swapTo({ from: "first", navigationType: "push" });

		expect(SLUGS.map((slug) => nameOf(imageOf({ root: newDocument, slug })))).toEqual(["", ""]);
	});

	it("stops listening once its signal is aborted, so a second run cannot stack a third", () => {
		controller.abort();
		prepare(linkTo("second"));

		expect(nameOf(imageOf({ root: document, slug: "second" }))).toBe("");
	});
});

describe("initFeaturedImageTransition", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("wires the page it initialises, and a second run replaces the first rather than doubling it", () => {
		document.body.innerHTML = `<ul>${cards(SLUGS)}</ul>`;

		initFeaturedImageTransition();
		initFeaturedImageTransition();
		prepare(linkTo("first"));

		expect(nameOf(imageOf({ root: document, slug: "first" }))).toBe(featuredImageTransitionName("first"));
	});
});
