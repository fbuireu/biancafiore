import { avatar, rawByline, rawEntry } from "@tests/doubles/cmsEntries";
import { cmsAnswers, cmsQueries, cmsReferenceQueries, resetCms } from "@tests/doubles/cmsLayer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleFields } from "../../dto/article/types";
import type { RawAuthor } from "../../dto/author/types";
import { authors } from "./authors";

vi.mock("@infrastructure/cms/client", async () => {
	const actual = await vi.importActual<typeof import("@infrastructure/cms/client")>("@infrastructure/cms/client");
	const { cmsClientLayer } = await import("@tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

const loadAll = async () => {
	const result = await authors.loader.loadCollection({ collection: "authors" });

	if ("error" in result) throw result.error;

	return result.entries;
};

interface MakeAuthorParams {
	name: string;
	slug: string;
}

const makeAuthor = ({ name, slug }: MakeAuthorParams): RawAuthor =>
	rawByline({
		slug,
		displayName: name,
		bio: "Content writer",
		avatar: avatar({ name: `${slug}.jpg` }),
		customFields: { job_title: "Writer", current_company: "Freelance" },
	});

interface MakeArticleParams {
	slug: string;
	publishDate: string;
	credits?: RawAuthor[];
}

const makeArticle = ({ slug, publishDate, credits = [BIANCA] }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		id: `article-${slug}`,
		slug,
		data: { title: slug, content: [], publish_date: publishDate },
		bylines: credits,
	});

const BIANCA = makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" });

beforeEach(() => {
	resetCms();
});

describe("authors loader", () => {
	it("reads the authors off the articles' own bylines, in one query and no reference read", async () => {
		cmsAnswers({ articles: [makeArticle({ slug: "hers", publishDate: "2024-01-01" })] });

		await loadAll();

		expect(cmsQueries.map(({ collection }) => collection)).toEqual(["articles"]);
		expect(cmsReferenceQueries).toEqual([]);
	});

	it("keys every entry by the author's slug, the identity GLOSSARY.md gives an Author", async () => {
		cmsAnswers({ articles: [makeArticle({ slug: "hers", publishDate: "2024-01-01" })] });

		const [entry] = await loadAll();

		expect(entry).toMatchObject({ id: "bianca-fiore", data: { name: "Bianca Fiore", slug: "bianca-fiore" } });
	});

	it("keeps two authors who share a display name apart, since the name is a label and the slug is the identity", async () => {
		const namesake = makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore-ii" });

		cmsAnswers({
			articles: [
				makeArticle({ slug: "hers", publishDate: "2024-01-01" }),
				makeArticle({ slug: "theirs", publishDate: "2024-01-01", credits: [namesake] }),
			],
		});

		const entries = await loadAll();

		expect(entries.map(({ id }) => id)).toEqual(["bianca-fiore", "bianca-fiore-ii"]);
	});

	it("calls the author's newest article the latest, whatever order the batch arrived in", async () => {
		cmsAnswers({
			articles: [
				makeArticle({ slug: "oldest", publishDate: "2023-01-01" }),
				makeArticle({ slug: "newest", publishDate: "2024-05-01" }),
				makeArticle({ slug: "middle", publishDate: "2024-03-01" }),
			],
		});

		const [entry] = await loadAll();

		expect(entry?.data.latestArticle).toEqual({ id: "newest", collection: "articles" });
	});

	it("gives each author only the articles that credit them", async () => {
		const guest = makeAuthor({ name: "A Guest", slug: "guest" });

		cmsAnswers({
			articles: [
				makeArticle({ slug: "hers", publishDate: "2024-05-01" }),
				makeArticle({ slug: "theirs", publishDate: "2024-01-01", credits: [guest] }),
			],
		});

		const [bianca, theGuest] = await loadAll();

		expect(bianca?.data.latestArticle).toEqual({ id: "hers", collection: "articles" });
		expect(theGuest?.data.latestArticle).toEqual({ id: "theirs", collection: "articles" });
	});
});
