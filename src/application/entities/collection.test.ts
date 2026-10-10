import { describe, expect, it, vi } from "vitest";
import { contentLoader } from "./collection";

interface Item extends Record<string, unknown> {
	slug: string;
	title: string;
}

const ITEMS: Item[] = [
	{ slug: "first", title: "First" },
	{ slug: "second", title: "Second" },
];

const identify = ({ slug }: Item) => slug;

describe("contentLoader", () => {
	it("answers every item keyed by the identity the collection declares, in the order the load answered", async () => {
		const loader = contentLoader({ name: "items", load: async () => ITEMS, identify });

		await expect(loader.loadCollection({ collection: "items" })).resolves.toEqual({
			entries: [
				{ id: "first", data: ITEMS[0] },
				{ id: "second", data: ITEMS[1] },
			],
		});
	});

	it("finds one entry in the whole load when the collection has no cheaper way to read it", async () => {
		const loader = contentLoader({ name: "items", load: async () => ITEMS, identify });

		await expect(loader.loadEntry({ filter: { id: "second" }, collection: "items" })).resolves.toEqual({
			id: "second",
			data: ITEMS[1],
		});
	});

	it("reads one entry its own way when the collection gives one, and never loads the whole collection", async () => {
		const load = vi.fn(async () => ITEMS);
		const loadOne = vi.fn(async (id: string) => ({ slug: id, title: "Read alone" }));
		const loader = contentLoader({ name: "items", load, identify, loadOne });

		await expect(loader.loadEntry({ filter: { id: "first" }, collection: "items" })).resolves.toEqual({
			id: "first",
			data: { slug: "first", title: "Read alone" },
		});
		expect(loadOne).toHaveBeenCalledWith("first");
		expect(load).not.toHaveBeenCalled();
	});

	it("answers a thrown value that is not an error as an error carrying its text, so the page can still report it", async () => {
		const loader = contentLoader<Item>({
			name: "items",
			load: () => Promise.reject("the CMS said no"),
			identify,
		});

		const result = await loader.loadCollection({ collection: "items" });

		expect(result).toEqual({ error: expect.any(Error) });
		expect("error" in result && result.error.message).toBe("the CMS said no");
	});

	it("answers a prerendered page from loadPrerendered without loading, since a build has no database to read", async () => {
		const load = vi.fn(async () => ITEMS);
		const loader = contentLoader({
			name: "items",
			load,
			identify,
			loadPrerendered: (id) => ({ slug: id, title: "Built" }),
		});

		await expect(
			loader.loadEntry({ collection: "items", filter: { id: "first", prerendered: true } }),
		).resolves.toEqual({
			id: "first",
			data: { slug: "first", title: "Built" },
		});
		expect(load).not.toHaveBeenCalled();
	});

	it("loads as usual for a page rendered on request, even when it can be prerendered", async () => {
		const loader = contentLoader({
			name: "items",
			load: async () => ITEMS,
			identify,
			loadPrerendered: () => ({ slug: "first", title: "Built" }),
		});

		await expect(
			loader.loadEntry({ collection: "items", filter: { id: "first", prerendered: false } }),
		).resolves.toEqual({
			id: "first",
			data: ITEMS[0],
		});
	});
});
