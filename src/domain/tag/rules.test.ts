import { buildTagIndexBuckets, resolveSlugCollisions } from "@domain/tag/rules";
import type { TagIndexEntryDTO } from "@domain/tag/types";
import { TagType } from "@domain/tag/types";
import { describe, expect, it } from "vitest";

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

const entry = (name: string, type: TagIndexEntryDTO["type"] = TagType.TAG): TagIndexEntryDTO =>
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
		const buckets = buildTagIndexBuckets([entry("craft"), entry("Culture"), entry("travel")]);

		expect(buckets.map(({ letter }) => letter)).toEqual(["C", "T"]);
	});

	it("orders the buckets A to Z, whatever order the entries arrived in", () => {
		const buckets = buildTagIndexBuckets([entry("zoology"), entry("anthropology"), entry("music")]);

		expect(buckets.map(({ letter }) => letter)).toEqual(["A", "M", "Z"]);
	});

	it("orders the entries inside a bucket by name, so the listing reads alphabetically", () => {
		const [bucket] = buildTagIndexBuckets([entry("crochet"), entry("craft"), entry("culture")]);

		expect(bucket?.entries.map(({ name }) => name)).toEqual(["craft", "crochet", "culture"]);
	});

	it("puts an Author Tag in the same bucket as a topical Tag, since both are addressed the same way", () => {
		const [bucket] = buildTagIndexBuckets([entry("Bianca Fiore", TagType.AUTHOR), entry("brutalism")]);

		expect(bucket?.entries.map(({ type }) => type)).toEqual([TagType.AUTHOR, TagType.TAG]);
	});

	it("answers no buckets for an index with nothing filed under it", () => {
		expect(buildTagIndexBuckets([])).toEqual([]);
	});
});
