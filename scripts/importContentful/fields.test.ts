import { describe, expect, it } from "vitest";
import type { ContentfulEntry } from "./contentful.ts";
import { articleBody, authorByline, BYLINE_FIELDS, socialNetworkName } from "./fields.ts";
import type { UploadedMedia } from "./portableText.ts";

const link = (id: string, linkType: "Entry" | "Asset" = "Entry") => ({ sys: { type: "Link", linkType, id } });

const entry = (id: string, contentType: string, fields: Record<string, unknown>): ContentfulEntry => ({
	sys: { id, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "", contentType: { sys: { id: contentType } } },
	fields,
});

const AVATAR: UploadedMedia = {
	id: "01AVATAR",
	url: "/_emdash/api/media/file/bianca.jpg",
	storageKey: "bianca.jpg",
	filename: "bianca.jpg",
	mimeType: "image/jpeg",
	width: 400,
	height: 400,
};

const context = (ids: Record<string, string> = {}) => ({
	entries: new Map<string, ContentfulEntry>(),
	assets: new Map(),
	media: new Map([["asset-avatar", AVATAR]]),
	ids: new Map(Object.entries(ids)),
	warnings: [],
	nextKey: () => "k",
});

describe("socialNetworkName", () => {
	it("names a network after its host, so the imported row starts with a name the editor can correct", () => {
		expect(socialNetworkName("https://www.linkedin.com/in/bianca")).toBe("Linkedin");
		expect(socialNetworkName("https://x.com/bianca")).toBe("X");
		expect(socialNetworkName("https://instagram.com/bianca")).toBe("Instagram");
	});
});

describe("authorByline", () => {
	it("turns a Contentful author into a byline, with the three fields bylines lack as custom fields", () => {
		const author = entry("author-1", "author", {
			slug: " bianca-fiore ",
			name: " Bianca Fiore ",
			description: "Content writer",
			jobTitle: "Writer",
			currentCompany: "Freelance",
			profileImage: link("asset-avatar", "Asset"),
			socialNetworks: ["https://www.linkedin.com/in/bianca", "https://x.com/bianca"],
		});

		expect(authorByline({ entry: author, context: context() })).toStrictEqual({
			slug: "bianca-fiore",
			displayName: "Bianca Fiore",
			bio: "Content writer",
			avatarMediaId: "01AVATAR",
			customFields: {
				job_title: "Writer",
				current_company: "Freelance",
				social_networks: "Linkedin | https://www.linkedin.com/in/bianca\nX | https://x.com/bianca",
			},
		});
	});

	it("leaves out what the author never filled in, rather than writing empty values", () => {
		expect(authorByline({ entry: entry("author-2", "author", { name: "A Guest" }), context: context() })).toStrictEqual(
			{
				slug: undefined,
				displayName: "A Guest",
				bio: undefined,
				customFields: {},
			},
		);
	});

	it("registers exactly the custom fields the site reads, shared across locales", () => {
		expect(BYLINE_FIELDS.map(({ slug }) => slug)).toEqual(["job_title", "current_company", "social_networks"]);
		expect(BYLINE_FIELDS.every(({ translatable }) => translatable === false)).toBe(true);
	});
});

describe("articleBody", () => {
	it("credits the article to the byline its Contentful author became", () => {
		const article = entry("article-1", "article", {
			title: "An article",
			slug: "an-article",
			publishDate: "2024-01-01",
			author: link("author-1"),
		});

		expect(articleBody({ entry: article, context: context({ "author-1": "01BYLINE" }) }).bylines).toStrictEqual([
			{ bylineId: "01BYLINE" },
		]);
	});
});
