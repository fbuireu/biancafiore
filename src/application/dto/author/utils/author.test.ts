import type { UnresolvedLink } from "contentful";
import { describe, expect, it } from "vitest";
import type { RawAuthor } from "../types";
import { authorIdentity, createAuthor } from "./author";

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
});

describe("authorIdentity", () => {
	it("answers the trimmed name and slug, the two strings every reader of a raw Author must agree on", () => {
		expect(authorIdentity({ fields: { name: " Bianca Fiore\n", slug: "  bianca-fiore " } })).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
		});
	});

	it("refuses an Author whose name is only padding, naming them, since the Tag Index files an Author Tag by name", () => {
		expect(() => authorIdentity({ sys: { id: "3kLmNoPq" }, fields: { name: "  ", slug: "bianca-fiore" } })).toThrow(
			'The Author "bianca-fiore" (sys.id 3kLmNoPq) has an empty name, so the Tag Index cannot file their Author Tag under a letter',
		);
	});

	it("refuses an Author whose slug is only padding, since no page could address them", () => {
		expect(() => authorIdentity({ sys: { id: "3kLmNoPq" }, fields: { name: "Bianca Fiore", slug: " " } })).toThrow(
			'The Author "Bianca Fiore" (sys.id 3kLmNoPq) has no slug, so no page can address them',
		);
	});

	it("is what createAuthor puts in the Byline, so the Byline and an Author Tag cannot disagree", () => {
		const raw = makeRawAuthor({ name: " Bianca Fiore ", slug: " bianca-fiore " });

		expect(createAuthor(raw)).toMatchObject(authorIdentity(raw));
	});
});

describe("createAuthor, given a link Contentful did not resolve", () => {
	const unresolvedLink = {
		sys: { type: "Link", linkType: "Entry", id: "5tK5nWFxOrTBpKS3nDLPtI" },
	} as UnresolvedLink<"Entry">;

	it("refuses it by its link id, rather than reading fields off undefined", () => {
		expect(() => createAuthor(unresolvedLink)).toThrow(
			"A raw author entry reached the mapper unresolved (5tK5nWFxOrTBpKS3nDLPtI), so no byline can name it",
		);
	});
});
