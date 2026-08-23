import type { RawAuthor } from "@application/dto/author/types";
import { createAuthor } from "@application/dto/author/utils/author";
import { describe, expect, it } from "vitest";

interface MakeRawAuthorParams {
	name?: string;
	slug?: string;
	description?: string;
	jobTitle?: string;
	currentCompany?: string;
	profileImage?: unknown;
	socialNetworks?: string[];
}

const makeRawAuthor = ({
	name = "Bianca Fiore",
	slug = "bianca-fiore",
	description = "Content writer",
	jobTitle = "Writer",
	currentCompany = "Freelance",
	profileImage = {
		fields: {
			file: {
				url: "//images.ctfassets.net/bianca.avif",
				contentType: "image/avif",
				details: { size: 1024, image: { width: 512, height: 512 } },
			},
		},
	},
	socialNetworks = ["https://linkedin.com/in/bianca"],
}: MakeRawAuthorParams = {}) =>
	({
		fields: { name, slug, description, jobTitle, currentCompany, profileImage, socialNetworks },
	}) as unknown as RawAuthor;

describe("createAuthor", () => {
	it("carries every authored field across and turns the profile image into url, dimensions and formats", () => {
		expect(createAuthor(makeRawAuthor())).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			description: "Content writer",
			jobTitle: "Writer",
			currentCompany: "Freelance",
			profileImage: {
				url: "https://images.ctfassets.net/bianca.avif",
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

	it("trims the display name Contentful padded", () => {
		expect(createAuthor(makeRawAuthor({ name: " Bianca Fiore\n" }))).toMatchObject({ name: "Bianca Fiore" });
	});

	it("omits the author's own article references, which only the author collection carries", () => {
		const author = createAuthor(makeRawAuthor());

		expect(author).not.toHaveProperty("articles");
		expect(author).not.toHaveProperty("latestArticle");
	});
});
