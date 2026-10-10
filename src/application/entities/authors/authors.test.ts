import { rawEntry, rawImage } from "@tests/doubles/cmsEntries";
import {
	cmsAnswers,
	cmsHoldsUntilQueries,
	cmsQueries,
	cmsQueriesOverlapped,
	cmsReferenceQueries,
	cmsRefersTo,
	resetCms,
} from "@tests/doubles/cmsLayer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleFields } from "../../dto/article/types";
import { AUTHOR_ARTICLES_FIELD, type AuthorFields, type RawAuthor } from "../../dto/author/types";
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
	rawEntry<AuthorFields, "articles">({
		id: `author-${slug}`,
		slug,
		data: {
			name,
			description: "Content writer",
			job_title: "Writer",
			current_company: "Freelance",
			profile_image: rawImage({ name: `${slug}.jpg`, width: 400, height: 400 }),
		},
	});

interface MakeArticleParams {
	slug: string;
	publishDate: string;
}

const makeArticle = ({ slug, publishDate }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		id: `article-${slug}`,
		slug,
		data: { title: slug, content: [], publish_date: publishDate },
	});

interface CreditParams {
	author: RawAuthor;
	articles: ReturnType<typeof makeArticle>[];
}

const credit = ({ author, articles }: CreditParams) =>
	cmsRefersTo({
		collection: "authors",
		id: author.id,
		field: AUTHOR_ARTICLES_FIELD,
		references: articles.map(({ id }) => ({ id })),
	});

const BIANCA = makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" });

beforeEach(() => {
	resetCms();
});

describe("authors loader", () => {
	it("asks for the authors, with the articles each one is credited with, and for the articles, in one batch", async () => {
		const hers = makeArticle({ slug: "hers", publishDate: "2024-01-01" });

		cmsAnswers({ authors: [BIANCA], articles: [hers] });
		credit({ author: BIANCA, articles: [hers] });
		cmsHoldsUntilQueries(2);

		await loadAll();

		expect(cmsQueries.map(({ collection }) => collection).toSorted()).toEqual(["articles", "authors"]);
		expect(cmsQueriesOverlapped()).toBe(true);
		expect(cmsReferenceQueries).toEqual([
			expect.objectContaining({ collection: "authors", id: BIANCA.id, field: AUTHOR_ARTICLES_FIELD }),
		]);
	});

	it("keys every entry by the author's slug, the identity CONTEXT.md gives an Author", async () => {
		cmsAnswers({ authors: [BIANCA], articles: [] });

		const [entry] = await loadAll();

		expect(entry).toMatchObject({ id: "bianca-fiore", data: { name: "Bianca Fiore", slug: "bianca-fiore" } });
	});

	it("keeps two authors who share a display name apart, since the name is a label and the slug is the identity", async () => {
		cmsAnswers({ authors: [BIANCA, makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore-ii" })], articles: [] });

		const entries = await loadAll();

		expect(entries.map(({ id }) => id)).toEqual(["bianca-fiore", "bianca-fiore-ii"]);
	});

	it("calls the author's newest article the latest, whatever order the batch arrived in", async () => {
		const articles = [
			makeArticle({ slug: "oldest", publishDate: "2023-01-01" }),
			makeArticle({ slug: "newest", publishDate: "2024-05-01" }),
			makeArticle({ slug: "middle", publishDate: "2024-03-01" }),
		];

		cmsAnswers({ authors: [BIANCA], articles });
		credit({ author: BIANCA, articles });

		const [entry] = await loadAll();

		expect(entry?.data.latestArticle).toEqual({ id: "newest", collection: "articles" });
	});

	it("gives an author only their own article, and no latest article when they have none", async () => {
		const ghost = makeAuthor({ name: "Ghost", slug: "ghost" });
		const hers = makeArticle({ slug: "hers", publishDate: "2024-05-01" });

		cmsAnswers({ authors: [BIANCA, ghost], articles: [hers] });
		credit({ author: BIANCA, articles: [hers] });

		const [bianca, theGhost] = await loadAll();

		expect(bianca?.data.latestArticle).toEqual({ id: "hers", collection: "articles" });
		expect(theGhost?.data.latestArticle).toBeUndefined();
	});
});
