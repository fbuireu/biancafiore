import { createBreadcrumbs } from "@domain/breadcrumb/rules";
import { describe, expect, it } from "vitest";

describe("createBreadcrumbs", () => {
	it("shows no trail at all on the home page", () => {
		expect(createBreadcrumbs({ currentPath: "/" })).toEqual([]);
	});

	it("prepends Home to every path that is not the home page", () => {
		expect(createBreadcrumbs({ currentPath: "/projects" })).toEqual([
			{ label: "Home", link: "/" },
			{ label: "Projects", link: "/projects" },
		]);
	});

	it("builds one cumulative link per segment of a nested path", () => {
		expect(createBreadcrumbs({ currentPath: "/articles/my-first-post" })).toEqual([
			{ label: "Home", link: "/" },
			{ label: "Articles", link: "/articles" },
			{ label: "My First Post", link: "/articles/my-first-post" },
		]);
	});

	it("treats a trailing slash as the same trail as the path without one", () => {
		expect(createBreadcrumbs({ currentPath: "/tags/long-form/" })).toEqual(
			createBreadcrumbs({ currentPath: "/tags/long-form" }),
		);
	});

	it("turns each slug into title-cased words for the label while the link keeps the slug", () => {
		const [, legal] = createBreadcrumbs({ currentPath: "/terms-and-conditions" });

		expect(legal).toEqual({ label: "Terms And Conditions", link: "/terms-and-conditions" });
	});

	it("capitalises a word that follows a number without touching the number", () => {
		expect(createBreadcrumbs({ currentPath: "/articles/2024-recap" }).at(-1)?.label).toBe("2024 Recap");
	});

	it("drops empty segments left by repeated slashes, collapsing them in the links too", () => {
		expect(createBreadcrumbs({ currentPath: "//articles//long-form" })).toEqual([
			{ label: "Home", link: "/" },
			{ label: "Articles", link: "/articles" },
			{ label: "Long Form", link: "/articles/long-form" },
		]);
	});

	it("still offers a way back Home when the path is empty", () => {
		expect(createBreadcrumbs({ currentPath: "" })).toEqual([{ label: "Home", link: "/" }]);
	});

	it("ignores segments that are only whitespace", () => {
		expect(createBreadcrumbs({ currentPath: "/ /articles" })).toEqual([
			{ label: "Home", link: "/" },
			{ label: "Articles", link: "/articles" },
		]);
	});

	it("keeps the deepest segment last, which is what the component renders as the current page", () => {
		const trail = createBreadcrumbs({ currentPath: "/tags/writing" });

		expect(trail.at(-1)).toEqual({ label: "Writing", link: "/tags/writing" });
	});
});
