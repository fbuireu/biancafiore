import { describe, expect, it } from "vitest";
import type { ContentfulAsset, ContentfulEntry } from "./contentful.ts";
import { isUploadable, preflight, unuploadableAsset } from "./preflight.ts";

const link = (id: string) => ({ sys: { type: "Link", linkType: "Entry", id } });

const entry = (id: string, contentType: string, fields: Record<string, unknown> = {}): ContentfulEntry =>
	({ sys: { id, contentType: { sys: { id: contentType } } }, fields }) as unknown as ContentfulEntry;

const AUTHOR = entry("author-1", "author");
const TAG = entry("tag-1", "tag");

const check = (migrated: ContentfulEntry[]) =>
	preflight({ migrated, entries: new Map(migrated.map((item) => [item.sys.id, item])) });

describe("preflight", () => {
	it("passes an article whose links all point at published entries", () => {
		const article = entry("article-1", "article", { author: link(AUTHOR.sys.id), tags: [link(TAG.sys.id)] });

		expect(check([AUTHOR, TAG, article])).toEqual({ errors: [], warnings: [] });
	});

	it("warns about every link to an entry Contentful did not deliver, since the import drops it", () => {
		const article = entry("article-1", "article", {
			author: link(AUTHOR.sys.id),
			tags: [link("draft-tag")],
			relatedArticles: [link("draft-article")],
		});

		expect(check([AUTHOR, article]).warnings).toEqual([
			"article article-1 links tags to draft-tag, which is not published in Contentful, so the link is dropped",
			"article article-1 links relatedArticles to draft-article, which is not published in Contentful, so the link is dropped",
		]);
	});

	it("refuses an article with no published author before anything is written, since the collection requires one", () => {
		const article = entry("article-1", "article", { author: link("draft-author") });

		expect(check([article]).errors).toEqual([
			"article article-1 has no published author, and the articles collection requires one",
		]);
	});
});

describe("isUploadable", () => {
	it.each([
		["image/jpeg", true],
		["video/mp4", true],
		["application/pdf", true],
		["image/svg+xml", false],
		["application/zip", false],
	])("answers %s as %s, the way EmDash's upload allowlist does", (contentType, expected) => {
		expect(isUploadable(contentType)).toBe(expected);
	});
});

describe("unuploadableAsset", () => {
	it("names the type of an asset EmDash would refuse, so a dry run reports it", () => {
		const asset = { fields: { file: { contentType: "image/svg+xml" } } } as unknown as ContentfulAsset;

		expect(unuploadableAsset(asset)).toBe("image/svg+xml");
	});

	it("names nothing for an asset it would store, or one with no file", () => {
		expect(unuploadableAsset({ fields: { file: { contentType: "image/png" } } } as unknown as ContentfulAsset)).toBe(
			undefined,
		);
		expect(unuploadableAsset(undefined)).toBe(undefined);
	});
});
