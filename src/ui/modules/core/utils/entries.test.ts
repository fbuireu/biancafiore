import { SITE_AUTHOR_SLUG } from "@const/const";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type ArticleEntry,
	getSiteAuthor,
	readArticle,
	readArticles,
	readAuthors,
	readCities,
	readProjects,
	readTag,
	readTags,
	readTestimonials,
	resolveArticle,
	resolveArticles,
} from "./entries";

const { collections, entries, asked } = vi.hoisted(() => ({
	collections: new Map<string, { entries?: unknown[]; error?: Error }>(),
	entries: new Map<string, { entry?: unknown; error?: Error }>(),
	asked: [] as string[],
}));

vi.mock("astro:content", () => ({
	getLiveCollection: async (collection: string) => {
		asked.push(collection);

		return collections.get(collection) ?? { entries: [] };
	},
	getLiveEntry: async (collection: string, id: string) => {
		asked.push(`${collection}:${id}`);

		return entries.get(`${collection}:${id}`) ?? {};
	},
}));

const notFound = () => Object.assign(new Error("Entry was not found."), { name: "LiveEntryNotFoundError" });

const article = (slug: string) => ({ id: slug, data: { slug } }) as unknown as ArticleEntry;

const reference = (id: string) => ({ id, collection: "articles" }) as const;

const slugsOf = (resolved: ArticleEntry[]) => resolved.map(({ id }) => id);

beforeEach(() => {
	collections.clear();
	entries.clear();
	asked.length = 0;
});

describe("the collection readers", () => {
	it.each([
		["articles", readArticles],
		["authors", readAuthors],
		["cities", readCities],
		["projects", readProjects],
		["tags", readTags],
		["testimonials", readTestimonials],
	])("read the %s live collection and answer its entries", async (collection, read) => {
		collections.set(collection, { entries: [{ id: "one", data: {} }] });

		await expect(read()).resolves.toEqual([{ id: "one", data: {} }]);
		expect(asked).toEqual([collection]);
	});

	it("answer an empty list when the loader answered no entries at all", async () => {
		collections.set("articles", {});

		await expect(readArticles()).resolves.toEqual([]);
	});

	it("throw the error the loader answered, so the page fails into the error page rather than rendering a hole", async () => {
		collections.set("articles", { error: new Error("emdash is unreachable") });

		await expect(readArticles()).rejects.toThrow("emdash is unreachable");
	});
});

describe("the entry readers", () => {
	it.each([
		["articles", readArticle],
		["tags", readTag],
	])("read one %s entry by its slug", async (collection, read) => {
		entries.set(`${collection}:a-slug`, { entry: { id: "a-slug", data: {} } });

		await expect(read("a-slug")).resolves.toEqual({ id: "a-slug", data: {} });
		expect(asked).toEqual([`${collection}:a-slug`]);
	});

	it("answer undefined for an entry the loader does not hold, which the page turns into a 404", async () => {
		entries.set("articles:missing", { error: notFound() });

		await expect(readArticle("missing")).resolves.toBeUndefined();
	});

	it("throw any other error the loader answered", async () => {
		entries.set("articles:broken", { error: new Error("emdash is unreachable") });

		await expect(readArticle("broken")).rejects.toThrow("emdash is unreachable");
	});
});

describe("resolveArticle", () => {
	it("answers the entry a reference points at", () => {
		expect(resolveArticle({ reference: reference("a-piece"), articles: [article("a-piece")] })).toMatchObject({
			id: "a-piece",
		});
	});

	it("answers undefined for a reference nothing resolves", () => {
		expect(resolveArticle({ reference: reference("unpublished"), articles: [article("a-piece")] })).toBeUndefined();
	});

	it("answers undefined when there is no reference at all", () => {
		expect(resolveArticle({ reference: undefined, articles: [article("a-piece")] })).toBeUndefined();
	});
});

describe("resolveArticles", () => {
	it("keeps the order the references were stored in, not the order of the collection", () => {
		const resolved = resolveArticles({
			references: [reference("third"), reference("first"), reference("second")],
			articles: [article("first"), article("second"), article("third")],
		});

		expect(slugsOf(resolved)).toEqual(["third", "first", "second"]);
	});

	it("drops what no longer exists rather than answering a hole", () => {
		const resolved = resolveArticles({
			references: [reference("kept"), reference("deleted"), reference("also-kept")],
			articles: [article("kept"), article("also-kept")],
		});

		expect(slugsOf(resolved)).toEqual(["kept", "also-kept"]);
	});

	it("answers nothing for an empty reference list", () => {
		expect(resolveArticles({ references: [], articles: [article("kept")] })).toEqual([]);
	});
});

describe("getSiteAuthor", () => {
	it("answers the author the site is about, out of every author the CMS holds", async () => {
		collections.set("authors", {
			entries: [
				{ id: "someone-else", data: { slug: "someone-else" } },
				{ id: SITE_AUTHOR_SLUG, data: { slug: SITE_AUTHOR_SLUG } },
			],
		});

		await expect(getSiteAuthor()).resolves.toMatchObject({ id: SITE_AUTHOR_SLUG });
	});

	it("refuses to render a page about nobody when the site author is missing", async () => {
		collections.set("authors", { entries: [{ id: "someone-else", data: { slug: "someone-else" } }] });

		await expect(getSiteAuthor()).rejects.toThrow(
			`The authors collection carries no author with the slug ${SITE_AUTHOR_SLUG}`,
		);
	});
});
