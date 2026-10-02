import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTagIndexBuckets, resolveSlugCollisions } from "./rules";
import type { TagIndexEntryDTO } from "./types";
import { TagType } from "./types";

const MACHINE_LOCALE = "sv";

interface EntryStubParams {
	name: string;
	slug: string;
	type: TagIndexEntryDTO["type"];
	articles?: string[];
}

const entryStub = ({ name, slug, type, articles = [] }: EntryStubParams): TagIndexEntryDTO =>
	({
		name,
		slug,
		type,
		articles: articles.map((id) => ({ id, collection: "articles" })),
	}) as TagIndexEntryDTO;

interface EntryParams {
	name: string;
	type?: TagIndexEntryDTO["type"];
}

const entry = ({ name, type = TagType.TAG }: EntryParams): TagIndexEntryDTO =>
	entryStub({ name, slug: name.toLowerCase().replaceAll(" ", "-"), type });

describe("resolveSlugCollisions", () => {
	it("leaves entries that address distinct slugs alone, in the order they arrived", () => {
		const entries = [
			entryStub({ name: "Craft", slug: "craft", type: TagType.TAG }),
			entryStub({ name: "Bianca Fiore", slug: "bianca-fiore", type: TagType.AUTHOR }),
		];

		expect(resolveSlugCollisions(entries)).toEqual(entries);
	});

	it("gives a slug a tag and an author share to the tag, whichever of the two came first", () => {
		const tag = entryStub({ name: "Bianca", slug: "bianca", type: TagType.TAG });
		const author = entryStub({ name: "Bianca Fiore", slug: "bianca", type: TagType.AUTHOR });

		expect(resolveSlugCollisions([tag, author])).toEqual([tag]);
		expect(resolveSlugCollisions([author, tag])).toEqual([tag]);
	});

	it("keeps the first of two tags claiming one slug, so a duplicate in the CMS costs the second", () => {
		const first = entryStub({ name: "Craft", slug: "craft", type: TagType.TAG, articles: ["first"] });
		const second = entryStub({ name: "Craft", slug: "craft", type: TagType.TAG, articles: ["second"] });

		expect(resolveSlugCollisions([first, second])).toEqual([first]);
	});

	it("keeps the first of two authors claiming one slug", () => {
		const first = entryStub({ name: "Ada", slug: "ada", type: TagType.AUTHOR, articles: ["first"] });
		const second = entryStub({ name: "Ada L", slug: "ada", type: TagType.AUTHOR, articles: ["second"] });

		expect(resolveSlugCollisions([first, second])).toEqual([first]);
	});

	it("answers a new array and leaves the input untouched", () => {
		const entries = [entryStub({ name: "Craft", slug: "craft", type: TagType.TAG })];
		const resolved = resolveSlugCollisions(entries);

		expect(resolved).not.toBe(entries);
		expect(entries).toHaveLength(1);
	});

	it("handles an empty index without failing", () => {
		expect(resolveSlugCollisions([])).toEqual([]);
	});
});

describe("buildTagIndexBuckets", () => {
	it("buckets entries by the first letter of their name, uppercased", () => {
		const buckets = buildTagIndexBuckets([
			entry({ name: "craft" }),
			entry({ name: "Culture" }),
			entry({ name: "travel" }),
		]);

		expect(buckets.map(({ letter }) => letter)).toEqual(["C", "T"]);
	});

	it("orders the buckets A to Z, whatever order the entries arrived in", () => {
		const buckets = buildTagIndexBuckets([
			entry({ name: "zoology" }),
			entry({ name: "anthropology" }),
			entry({ name: "music" }),
		]);

		expect(buckets.map(({ letter }) => letter)).toEqual(["A", "M", "Z"]);
	});

	it("orders the entries inside a bucket by name, so the listing reads alphabetically", () => {
		const [bucket] = buildTagIndexBuckets([
			entry({ name: "crochet" }),
			entry({ name: "craft" }),
			entry({ name: "culture" }),
		]);

		expect(bucket?.entries.map(({ name }) => name)).toEqual(["craft", "crochet", "culture"]);
	});

	it("puts an Author Tag in the same bucket as a topical Tag, since both are addressed the same way", () => {
		const [bucket] = buildTagIndexBuckets([
			entry({ name: "Bianca Fiore", type: TagType.AUTHOR }),
			entry({ name: "brutalism" }),
		]);

		expect(bucket?.entries.map(({ type }) => type)).toEqual([TagType.AUTHOR, TagType.TAG]);
	});

	it("answers no buckets for an index with nothing filed under it", () => {
		expect(buildTagIndexBuckets([])).toEqual([]);
	});
});

describe("buildTagIndexBuckets on a machine whose own locale collates Ö after Z", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("orders the letters and the names inside them under the site's locale, so every build prints one Tag Index", () => {
		vi.spyOn(String.prototype, "localeCompare").mockImplementation(function (
			this: string,
			that: string,
			locales?: Intl.LocalesArgument,
		) {
			return new Intl.Collator(locales ?? MACHINE_LOCALE).compare(this, that);
		});

		const buckets = buildTagIndexBuckets([
			entry({ name: "Zebra" }),
			entry({ name: "Österreich" }),
			entry({ name: "Oz" }),
			entry({ name: "Oåsis" }),
		]);

		expect(buckets.map(({ letter, entries }) => [letter, entries.map(({ name }) => name)])).toEqual([
			["O", ["Oåsis", "Oz"]],
			["Ö", ["Österreich"]],
			["Z", ["Zebra"]],
		]);
	});
});
