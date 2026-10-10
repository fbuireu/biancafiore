import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { avatar, rawByline, rawEntry } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { ArticleFields } from "../../article/types";
import type { RawAuthor } from "../types";
import { bylineAuthor, createAuthor, creditedAuthors, credits } from "./author";

interface MakeRawAuthorParams {
	slug?: string;
	displayName?: string;
	customFields?: Record<string, unknown>;
}

const makeRawAuthor = ({
	slug = "bianca-fiore",
	displayName = "Bianca Fiore",
	customFields = {
		job_title: "Writer",
		current_company: "Freelance",
		social_networks: "LinkedIn | https://linkedin.com/in/bianca",
	},
}: MakeRawAuthorParams = {}): RawAuthor =>
	rawByline({
		slug,
		displayName,
		bio: "Content writer",
		avatar: avatar({ name: "bianca.avif", width: 512, height: 512, mimeType: "image/avif" }),
		customFields,
	});

interface MakeRawArticleParams {
	slug?: string | null;
	bylines?: RawAuthor[];
}

const makeRawArticle = ({ slug = "an-article", bylines = [] }: MakeRawArticleParams = {}) =>
	rawEntry<ArticleFields>({
		id: "01ARTICLE",
		slug,
		data: { title: "An article", content: [], publish_date: "2024-01-01" },
		bylines,
	});

describe("createAuthor", () => {
	it("carries the byline and its custom fields across, and turns the avatar into url, dimensions and formats", () => {
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
		expect(createAuthor(makeRawAuthor({ displayName: " Bianca Fiore\n" }))).toMatchObject({ name: "Bianca Fiore" });
	});

	it("reads a custom field nobody filled in as empty, and no social networks as none", () => {
		expect(createAuthor(makeRawAuthor({ customFields: {} }))).toMatchObject({
			jobTitle: "",
			currentCompany: "",
			socialNetworks: [],
		});
	});

	it("refuses a byline EmDash stored without a slug, naming it, since no page could address it", () => {
		expect(() => createAuthor({ ...makeRawAuthor(), slug: null })).toThrow(
			'The Author "Bianca Fiore" (id byline-bianca-fiore) has no slug, so no page can address them',
		);
	});

	it("refuses an author whose name is only padding, naming them, since the Tag Index files them under a letter", () => {
		expect(() => createAuthor(makeRawAuthor({ displayName: "   " }))).toThrow("has an empty name");
	});

	it("refuses an author with no avatar, naming them, rather than emitting a profile with no picture", () => {
		const { avatar: _avatar, ...withoutAvatar } = makeRawAuthor();

		expect(() => createAuthor(withoutAvatar)).toThrow(
			'The Author "bianca-fiore" (id byline-bianca-fiore) has no avatar, so no profile image can render',
		);
	});
});

describe("credits", () => {
	it("reads the author off the article's own credits", () => {
		const rawAuthor = makeRawAuthor();

		expect(credits({ rawAuthor, rawArticle: makeRawArticle({ bylines: [rawAuthor] }) })).toBe(true);
		expect(credits({ rawAuthor, rawArticle: makeRawArticle() })).toBe(false);
	});
});

describe("creditedAuthors", () => {
	it("answers every byline credited on any article once, in the order they first appear", () => {
		const bianca = makeRawAuthor();
		const guest = makeRawAuthor({ slug: "guest", displayName: "A Guest" });

		expect(
			creditedAuthors([
				makeRawArticle({ slug: "one", bylines: [bianca] }),
				makeRawArticle({ slug: "two", bylines: [guest, bianca] }),
				makeRawArticle(),
			]),
		).toStrictEqual([bianca, guest]);
	});
});

describe("bylineAuthor", () => {
	it("answers the article's first credited byline, which is the one its byline names", () => {
		const first = makeRawAuthor();
		const second = makeRawAuthor({ slug: "someone" });

		expect(
			bylineAuthor({ rawArticle: makeRawArticle({ bylines: [first, second] }), rawAuthors: [second, first] }),
		).toBe(first);
	});

	it("refuses an article no byline credits, naming it by its slug", () => {
		expect(() => bylineAuthor({ rawArticle: makeRawArticle(), rawAuthors: [makeRawAuthor()] })).toThrow(
			"An Article (an-article) is credited to no byline, so no byline can name it",
		);
	});

	it("names the article by its id when it carries no slug to name it by", () => {
		expect(() => bylineAuthor({ rawArticle: makeRawArticle({ slug: null }), rawAuthors: [] })).toThrow("(01ARTICLE)");
	});
});
