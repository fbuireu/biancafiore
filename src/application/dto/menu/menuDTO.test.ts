import { MENU_NAME } from "@domain/menu";
import { describe, expect, it } from "vitest";
import { DEFAULT_MENU_ITEMS } from "./defaults";
import { createMenu } from "./menuDTO";

interface ItemParams {
	label: string;
	url: string;
	target?: string;
}

const item = ({ label, url, target }: ItemParams) => ({ label, url, target: target ?? null, children: [] });

describe("createMenu", () => {
	it("splits a label around its bracketed link, so the words beside the link stay prose", () => {
		const { items } = createMenu({
			name: MENU_NAME.HEADER,
			items: [item({ label: "back to start [Home]", url: "/" })],
		});

		expect(items).toEqual([
			{ label: "Home", href: "/", before: "back to start", after: undefined, opensInNewTab: false },
		]);
	});

	it("links the whole label when it carries no brackets", () => {
		expect(
			createMenu({ name: MENU_NAME.FOOTER, items: [item({ label: "Privacy Policy", url: "/privacy-policy" })] })
				.items[0],
		).toMatchObject({
			label: "Privacy Policy",
			before: undefined,
			after: undefined,
		});
	});

	it("keeps the words after the link", () => {
		expect(
			createMenu({ name: MENU_NAME.HEADER, items: [item({ label: "know more [About] me", url: "/about" })] }).items[0],
		).toMatchObject({
			before: "know more",
			label: "About",
			after: "me",
		});
	});

	it("opens in a new tab only when the editor said so", () => {
		expect(
			createMenu({
				name: MENU_NAME.FOOTER,
				items: [item({ label: "Elsewhere", url: "https://example.com", target: "_blank" })],
			}).items[0]?.opensInNewTab,
		).toBe(true);
	});

	it.each(["javascript:alert(1)", "data:text/html,x", "//evil.example"])("drops an item whose URL is %s", (url) => {
		expect(
			createMenu({
				name: MENU_NAME.HEADER,
				items: [item({ label: "Bad", url: url }), item({ label: "Good", url: "/articles" })],
			}).items.map(({ href }) => href),
		).toEqual(["/articles"]);
	});

	it.each(["/articles", "#top", "https://example.com", "mailto:a@example.com", "tel:+34600000000"])(
		"keeps an item whose URL is %s",
		(url) => {
			expect(createMenu({ name: MENU_NAME.HEADER, items: [item({ label: "Fine", url: url })] }).items).toHaveLength(1);
		},
	);

	it.each(Object.values(MENU_NAME))("hands back today's %s links when the menu does not exist", (name) => {
		expect(createMenu({ name }).items).toEqual(DEFAULT_MENU_ITEMS[name]);
	});

	it("keeps an emptied menu empty, since an editor who removed every link meant it", () => {
		expect(createMenu({ name: MENU_NAME.FOOTER, items: [] }).items).toEqual([]);
	});
});
