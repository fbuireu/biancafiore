import { describe, expect, it } from "vitest";
import { featuredImageTransitionName } from "./transition";

describe("featuredImageTransitionName", () => {
	it("names the view transition after the Article's Slug, so a card and its page pair the same image", () => {
		expect(featuredImageTransitionName("a-week-of-london-mornings")).toBe("featured-image-a-week-of-london-mornings");
	});

	it("names two Articles differently, since two images on one page must not share a transition name", () => {
		expect(featuredImageTransitionName("first")).not.toBe(featuredImageTransitionName("second"));
	});
});
