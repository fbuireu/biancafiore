import { tagDTO } from "@application/dto/tag";
import type { RawTag } from "@application/dto/tag/types";
import type { Entry, EntrySkeletonType } from "contentful";
import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({ reference: () => ({ parse: (value: unknown) => value }) }));

interface NamedParams {
	name: string;
	slug: string;
}

const makeTag = ({ name, slug }: NamedParams) => ({ fields: { name, slug } }) as unknown as RawTag;

const makeAuthor = ({ name, slug }: NamedParams) => ({ fields: { name, slug } }) as unknown as Entry<EntrySkeletonType>;

interface MakeArticleParams {
	slug: string;
	authorSlug?: string;
	tagSlugs?: string[];
}

const makeArticle = ({ slug, authorSlug, tagSlugs }: MakeArticleParams) =>
	({
		fields: {
			slug,
			author: authorSlug === undefined ? undefined : { fields: { slug: authorSlug } },
			tags: tagSlugs?.map((tagSlug) => ({ fields: { slug: tagSlug } })),
		},
	}) as unknown as Entry<EntrySkeletonType>;

describe("tagDTO grouping", () => {
	it("buckets tags and authors together under the uppercase initial of their name", () => {
		const grouped = tagDTO.create([
			[makeTag({ name: "craft", slug: "craft" })],
			[makeArticle({ slug: "first", authorSlug: "bianca-fiore", tagSlugs: ["craft"] })],
			[makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		]);

		expect(Object.keys(grouped)).toEqual(["B", "C"]);
		expect(grouped.C?.map(({ name }) => name)).toEqual(["craft"]);
		expect(grouped.B?.map(({ name }) => name)).toEqual(["Bianca Fiore"]);
	});

	it("sorts the buckets alphabetically and the entries inside a bucket by name", () => {
		const article = makeArticle({ slug: "first", authorSlug: "ada", tagSlugs: ["craft", "cities", "travel"] });

		const grouped = tagDTO.create([
			[
				makeTag({ name: "Travel", slug: "travel" }),
				makeTag({ name: "Craft", slug: "craft" }),
				makeTag({ name: "Cities", slug: "cities" }),
			],
			[article],
			[makeAuthor({ name: "Ada Lovelace", slug: "ada" })],
		]);

		expect(Object.keys(grouped)).toEqual(["A", "C", "T"]);
		expect(grouped.C?.map(({ name }) => name)).toEqual(["Cities", "Craft"]);
	});

	it("maps an entirely empty CMS to an empty grouping, synchronously", () => {
		const grouped = tagDTO.create([[], [], []]);

		expect(grouped).toEqual({});
		expect(grouped).not.toBeInstanceOf(Promise);
	});
});

describe("tagDTO tag entries", () => {
	it("counts the articles carrying the tag and lists them as articles collection references", () => {
		const grouped = tagDTO.create([
			[makeTag({ name: "Craft", slug: "craft" })],
			[
				makeArticle({ slug: "first", tagSlugs: ["craft"] }),
				makeArticle({ slug: "second", tagSlugs: ["craft", "travel"] }),
				makeArticle({ slug: "third", tagSlugs: ["travel"] }),
			],
			[],
		]);

		expect(grouped.C?.at(0)).toEqual({
			name: "Craft",
			slug: "craft",
			type: "tag",
			count: 2,
			articles: [
				{ id: "first", collection: "articles" },
				{ id: "second", collection: "articles" },
			],
		});
	});

	it("drops a tag no article references, so the index never shows an empty bucket", () => {
		const grouped = tagDTO.create([
			[makeTag({ name: "Craft", slug: "craft" }), makeTag({ name: "Orphan", slug: "orphan" })],
			[makeArticle({ slug: "first", tagSlugs: ["craft"] })],
			[],
		]);

		expect(Object.keys(grouped)).toEqual(["C"]);
	});

	it("trims the whitespace Contentful preserves on both sides of the match", () => {
		const grouped = tagDTO.create([
			[makeTag({ name: "  Craft  ", slug: "  craft  " })],
			[makeArticle({ slug: "  first  ", tagSlugs: [" craft "] })],
			[],
		]);

		expect(grouped.C?.at(0)).toMatchObject({
			name: "Craft",
			slug: "craft",
			articles: [{ id: "first", collection: "articles" }],
		});
	});

	it("ignores articles with no tag list at all", () => {
		const grouped = tagDTO.create([
			[makeTag({ name: "Craft", slug: "craft" })],
			[makeArticle({ slug: "untagged" })],
			[],
		]);

		expect(grouped).toEqual({});
	});
});

describe("tagDTO author entries", () => {
	it("turns an author into a tag of type author, counting the articles they signed", () => {
		const grouped = tagDTO.create([
			[],
			[
				makeArticle({ slug: "first", authorSlug: "bianca-fiore" }),
				makeArticle({ slug: "second", authorSlug: "someone-else" }),
			],
			[makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		]);

		expect(grouped.B?.at(0)).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			type: "author",
			count: 1,
			articles: [{ id: "first", collection: "articles" }],
		});
	});

	it("drops an author who has not published anything", () => {
		const grouped = tagDTO.create([[], [], [makeAuthor({ name: "Ghost Writer", slug: "ghost" })]]);

		expect(grouped).toEqual({});
	});

	it("matches an author on the slug, so an article by a namesake with another slug does not count", () => {
		const grouped = tagDTO.create([
			[],
			[makeArticle({ slug: "first", authorSlug: "b-fiore" })],
			[makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		]);

		expect(grouped).toEqual({});
	});

	it("keeps two authors who share a display name apart, each counting only the articles under its own slug", () => {
		const grouped = tagDTO.create([
			[],
			[
				makeArticle({ slug: "hers", authorSlug: "bianca-fiore" }),
				makeArticle({ slug: "the-namesakes", authorSlug: "b-fiore" }),
			],
			[
				makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" }),
				makeAuthor({ name: "Bianca Fiore", slug: "b-fiore" }),
			],
		]);

		expect(grouped.B).toEqual([
			{
				name: "Bianca Fiore",
				slug: "bianca-fiore",
				type: "author",
				count: 1,
				articles: [{ id: "hers", collection: "articles" }],
			},
			{
				name: "Bianca Fiore",
				slug: "b-fiore",
				type: "author",
				count: 1,
				articles: [{ id: "the-namesakes", collection: "articles" }],
			},
		]);
	});

	it("ignores author links Contentful left unresolved instead of counting them", () => {
		const grouped = tagDTO.create([
			[],
			[{ fields: { slug: "first", author: { sys: { type: "Link" } } } } as unknown as Entry<EntrySkeletonType>],
			[makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		]);

		expect(grouped).toEqual({});
	});
});
