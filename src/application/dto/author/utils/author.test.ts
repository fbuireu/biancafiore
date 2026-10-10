import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { rawEntry, rawImage, referenceTo } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { ArticleFields } from "../../article/types";
import type { AuthorFields, RawAuthor } from "../types";
import { bylineAuthor, createAuthor, credits } from "./author";

interface MakeRawAuthorParams extends Partial<AuthorFields> {
	slug?: string;
	credited?: Array<{ id: string }>;
}

const makeRawAuthor = ({ slug = "bianca-fiore", credited = [], ...fields }: MakeRawAuthorParams = {}): RawAuthor =>
	rawEntry<AuthorFields, "articles">({
		slug,
		data: {
			name: "Bianca Fiore",
			description: "Content writer",
			job_title: "Writer",
			current_company: "Freelance",
			profile_image: rawImage({ name: "bianca.avif", width: 512, height: 512, mimeType: "image/avif" }),
			social_networks: [{ url: "https://linkedin.com/in/bianca" }],
			...fields,
		},
		references: { articles: credited.map((article) => referenceTo(article)) },
	});

const makeRawArticle = (slug: string | null = "an-article") =>
	rawEntry<ArticleFields>({
		id: "01ARTICLE",
		slug,
		data: { title: "An article", content: [], publish_date: "2024-01-01" },
	});

describe("createAuthor", () => {
	it("carries every authored field across and turns the profile image into url, dimensions and formats", () => {
		expect(createAuthor(makeRawAuthor())).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			description: "Content writer",
			jobTitle: "Writer",
			currentCompany: "Freelance",
			profileImage: {
				url: `${MEDIA_FILE_PATH}bianca.avif`,
				details: { width: 512, height: 512 },
				formats: { avif: true, webp: false },
				shareCrops: expect.any(Array),
			},
			socialNetworks: ["https://linkedin.com/in/bianca"],
		});
	});

	it("trims the slug, so the one an author page is generated from and the one a byline links to are the same string", () => {
		expect(createAuthor(makeRawAuthor({ slug: "  bianca-fiore " }))).toMatchObject({ slug: "bianca-fiore" });
	});

	it("trims the display name the CMS padded", () => {
		expect(createAuthor(makeRawAuthor({ name: " Bianca Fiore\n" }))).toMatchObject({ name: "Bianca Fiore" });
	});

	it("answers no social networks for an author who listed none, rather than failing on the missing rows", () => {
		expect(createAuthor(makeRawAuthor({ social_networks: undefined })).socialNetworks).toEqual([]);
	});

	it("refuses an author EmDash stored without a slug, naming them, since no page could address them", () => {
		expect(() => createAuthor({ ...makeRawAuthor(), slug: null })).toThrow(
			'The Author "Bianca Fiore" (id id-bianca-fiore) has no slug, so no page can address them',
		);
	});

	it("refuses an author whose name is only padding, naming them, since the Tag Index files them under a letter", () => {
		expect(() => createAuthor(makeRawAuthor({ name: "   " }))).toThrow("has an empty name");
	});
});

describe("credits", () => {
	it("reads the article off the author's own list, which is the end of the relation EmDash lists in one read", () => {
		const rawArticle = makeRawArticle();

		expect(credits({ rawAuthor: makeRawAuthor({ credited: [rawArticle] }), rawArticle })).toBe(true);
		expect(credits({ rawAuthor: makeRawAuthor(), rawArticle })).toBe(false);
	});
});

describe("bylineAuthor", () => {
	it("answers the published author whose list credits the article", () => {
		const rawArticle = makeRawArticle();
		const author = makeRawAuthor({ credited: [rawArticle] });

		expect(bylineAuthor({ rawArticle, rawAuthors: [makeRawAuthor({ slug: "someone" }), author] })).toBe(author);
	});

	it("refuses an article no published author credits, naming it by its slug", () => {
		expect(() => bylineAuthor({ rawArticle: makeRawArticle(), rawAuthors: [makeRawAuthor()] })).toThrow(
			"An Article (an-article) is credited to no published author, so no byline can name it",
		);
	});

	it("names the article by its id when it carries no slug to name it by", () => {
		expect(() => bylineAuthor({ rawArticle: makeRawArticle(null), rawAuthors: [] })).toThrow("(01ARTICLE)");
	});
});
