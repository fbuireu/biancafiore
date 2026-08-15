import { resolveSlugCollisions } from "@domain/tag/rules";
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
