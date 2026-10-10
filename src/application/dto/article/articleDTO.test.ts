import type { CmsReference } from "@infrastructure/cms/entries";
import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { rawEntry, rawImage, referenceTo, term } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { AuthorFields, RawAuthor } from "../author/types";
import type { RawTag } from "../tag/types";
import { createArticle, createArticles } from ".";
import type { AnyRawArticle, ArticleFields, ArticleReference, RawArticle } from "./types";

let key = 0;

interface BlockParams {
	text: string;
	style?: string;
}

const block = ({ text, style = "normal" }: BlockParams) => ({
	_type: "block",
	_key: `k${key++}`,
	style,
	children: [{ _type: "span", _key: `k${key++}`, text, marks: [] as string[] }],
	markDefs: [],
});

const paragraph = (text: string) => block({ text });

interface HeadingParams {
	level: number;
	value: string;
}

const heading = ({ level, value }: HeadingParams) => block({ text: value, style: `h${level}` });

const AUTHOR = rawEntry<AuthorFields, "articles">({
	id: "author-bianca",
	slug: "bianca-fiore",
	data: {
		name: "Bianca Fiore",
		description: "Content writer",
		job_title: "Writer",
		current_company: "Freelance",
		profile_image: rawImage({ name: "bianca.webp", mimeType: "image/webp" }),
		social_networks: [{ url: "https://linkedin.com/in/bianca" }],
	},
	references: { articles: [] },
});

const CRAFT = term({ slug: "craft", label: "Craft" });
const TRAVEL = term({ slug: "travel", label: "Travel" });

interface MakeArticleParams {
	slug?: string;
	title?: string;
	content?: unknown[];
	description?: string;
	publishDate?: string;
	updatedAt?: string;
	featuredImage?: ArticleFields["featured_image"];
	featuredArticle?: boolean;
	isFavorite?: boolean;
	isRepublished?: boolean;
	originalSource?: string;
	tags?: RawTag[];
	relatedArticles?: CmsReference[];
}

const makeArticle = ({
	slug = "an-article",
	title = "An article",
	content = [paragraph("Hello world")],
	publishDate = "2024-03-15",
	updatedAt,
	description,
	featuredImage,
	featuredArticle,
	isFavorite,
	isRepublished,
	originalSource,
	tags = [],
	relatedArticles = [],
}: MakeArticleParams = {}): RawArticle<ArticleReference> =>
	rawEntry<ArticleFields, ArticleReference>({
		id: `article-${slug.trim()}`,
		slug,
		updatedAt,
		terms: { tag: tags },
		data: {
			title,
			content: content as ArticleFields["content"],
			description,
			publish_date: publishDate,
			featured_image: featuredImage,
			featured_article: featuredArticle,
			is_favorite: isFavorite,
			is_republished: isRepublished,
			original_source: originalSource,
		},
		references: { related_articles: relatedArticles },
	});

const related = (slug: string) => ({ id: `article-${slug.trim()}` });

const crediting = (rawArticles: AnyRawArticle[]): RawAuthor => ({
	...AUTHOR,
	references: { articles: rawArticles.map((rawArticle) => referenceTo(rawArticle)) },
});

const create = (rawArticles: AnyRawArticle[]) => createArticles({ rawArticles, rawAuthors: [crediting(rawArticles)] });

describe("createArticles defaults for optional CMS fields", () => {
	it("defaults isFavorite and isRepublished to false when the CMS omits both flags", () => {
		const [article] = create([makeArticle()]);

		expect(article).toMatchObject({ isFavorite: false, isRepublished: false, originalSource: undefined });
	});

	it("keeps the authored flags when the CMS does send them", () => {
		const [article] = create([
			makeArticle({ isFavorite: true, isRepublished: true, originalSource: "https://medium.com/post" }),
		]);

		expect(article).toMatchObject({
			isFavorite: true,
			isRepublished: true,
			originalSource: "https://medium.com/post",
		});
	});

	it("passes isFeaturedArticle through, and reads an unticked one as false", () => {
		expect(create([makeArticle({ featuredArticle: true })])[0].isFeaturedArticle).toBe(true);
		expect(create([makeArticle()])[0].isFeaturedArticle).toBe(false);
	});
});

describe("createArticles description", () => {
	it("falls back to the rendered content, stripped of markup and collapsed, when there is no description", () => {
		const [article] = create([
			makeArticle({ content: [heading({ level: 2, value: "Intro" }), paragraph("Body text")] }),
		]);

		expect(article.description).toBe("Intro Body text");
	});

	it("truncates a fallback description longer than 200 characters, keeping the opening words verbatim", () => {
		const long = Array.from({ length: 60 }, (_, index) => `word${index}`).join(" ");

		const [article] = create([makeArticle({ content: [paragraph(long)] })]);

		expect(article.description).toBe(`${long.slice(0, 200)}...`);
	});

	it("cleans an authored description rather than trusting the CMS whitespace", () => {
		const [article] = create([makeArticle({ description: "  A   <em>bold</em>\nclaim  " })]);

		expect(article.description).toBe("A bold claim");
	});

	it("reads a description the editor cleared as none, since EmDash keeps the empty string", () => {
		const [article] = create([makeArticle({ description: "", content: [paragraph("Fallback")] })]);

		expect(article.description).toBe("Fallback");
	});

	it("derives the fallback from the plain text, so the external-link cue never reaches the description", () => {
		const linked = {
			...paragraph("Read it"),
			children: [{ _type: "span", _key: "s", text: "Read it", marks: ["l"] }],
			markDefs: [{ _type: "link", _key: "l", href: "https://example.com" }],
		};
		const [article] = create([makeArticle({ content: [linked] })]);

		expect(article.description).toBe("Read it");
		expect(article.content).toContain("external-link-icon");
	});
});

describe("createArticles images", () => {
	it("maps a featured image to url, pixel dimensions and format flags", () => {
		const [article] = create([makeArticle({ featuredImage: rawImage({ name: "hero.avif", mimeType: "image/avif" }) })]);

		expect(article.featuredImage).toEqual({
			url: `${MEDIA_FILE_PATH}hero.avif`,
			details: { width: 1200, height: 630 },
			formats: { avif: true, webp: false },
			shareCrops: expect.any(Array),
		});
	});

	it("leaves featuredImage undefined without one", () => {
		expect(create([makeArticle()])[0].featuredImage).toBeUndefined();
	});
});

describe("createArticles dates", () => {
	it("stores the machine readable date and leaves the label to the renderer", () => {
		const [article] = create([makeArticle({ publishDate: "2024-03-15" })]);

		expect(article.publishDateISO).toBe("2024-03-15T00:00:00.000Z");
		expect(article).not.toHaveProperty("publishDate");
	});

	it.each([
		["missing", ""],
		["unreadable", "not a date"],
	])("refuses an entry whose publish date is %s, naming the value rather than throwing bare", (_name, publishDate) => {
		expect(() => create([makeArticle({ publishDate })])).toThrow("unreadable publish date");
	});

	it("reads updatedAt off the entry, normalised to the same ISO instant the publish date gets", () => {
		const [article] = create([makeArticle({ updatedAt: "2024-04-01T10:00:00+02:00" })]);

		expect(article.updatedAt).toBe("2024-04-01T08:00:00.000Z");
	});

	it("refuses an updatedAt it cannot read, rather than emitting it into the structured data", () => {
		expect(() => create([makeArticle({ updatedAt: "not-a-date" })])).toThrow(
			"An Article reached the mapper with an unreadable publish date: not-a-date",
		);
	});
});

describe("createArticles related articles", () => {
	it("maps hand-picked related articles to slug references and drops any that is not published", () => {
		const [article] = create([
			makeArticle({ relatedArticles: [related("resolved-one"), related("a-draft")] }),
			makeArticle({ slug: "resolved-one", title: "Resolved" }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "resolved-one", collection: "articles" }]);
	});

	it("keeps to a hand-picked list even when none of its picks is published, rather than inferring one", () => {
		const [article] = create([
			makeArticle({ slug: "first", tags: [CRAFT], relatedArticles: [related("a-draft")] }),
			makeArticle({ slug: "second", title: "Second", tags: [CRAFT] }),
		]);

		expect(article.relatedArticles).toEqual([]);
	});

	it("derives related articles from a shared tag when the editor picked none", () => {
		const [article] = create([
			makeArticle({ slug: "first", title: "First", tags: [CRAFT] }),
			makeArticle({ slug: "second", title: "Second", tags: [CRAFT, TRAVEL] }),
			makeArticle({ slug: "third", title: "Third", tags: [TRAVEL] }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "second", collection: "articles" }]);
	});

	it("caps the derived related articles at six", () => {
		const siblings = Array.from({ length: 9 }, (_, index) =>
			makeArticle({ slug: `sibling-${index}`, title: `Sibling ${index}`, tags: [CRAFT] }),
		);

		const [article] = create([makeArticle({ slug: "first", title: "First", tags: [CRAFT] }), ...siblings]);

		expect(article.relatedArticles).toHaveLength(6);
		expect(article.relatedArticles?.at(0)).toEqual({ id: "sibling-0", collection: "articles" });
	});

	it("leaves a hand-picked list uncapped, because an author who picks eight articles means eight", () => {
		const picks = Array.from({ length: 8 }, (_, index) => makeArticle({ slug: `pick-${index}` }));

		const [article] = create([
			makeArticle({ slug: "first", relatedArticles: picks.map(({ slug }) => related(slug ?? "")) }),
			...picks,
		]);

		expect(article.relatedArticles).toHaveLength(8);
	});

	it("suggests a namesake article, because an article is excluded by its slug and not by its title", () => {
		const [article] = create([
			makeArticle({ slug: "first", title: "Same title", tags: [CRAFT] }),
			makeArticle({ slug: "namesake", title: "Same title", tags: [CRAFT] }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "namesake", collection: "articles" }]);
	});

	it("drops a hand-picked reference an editor pointed back at the article itself", () => {
		const [article] = create([
			makeArticle({ slug: "first", relatedArticles: [related("  first  "), related("second")] }),
			makeArticle({ slug: "second" }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "second", collection: "articles" }]);
	});

	it("excludes the article from its own derived list even when it carries its own tags twice over", () => {
		const [article] = create([makeArticle({ slug: "  first  ", title: "First", tags: [CRAFT, CRAFT] })]);

		expect(article.relatedArticles).toEqual([]);
	});

	it("derives nothing for an article with no tags at all", () => {
		const [article] = create([
			makeArticle({ slug: "first", title: "First" }),
			makeArticle({ slug: "second", title: "Second", tags: [CRAFT] }),
		]);

		expect(article.relatedArticles).toEqual([]);
	});
});

describe("createArticles tags", () => {
	it("trims the whitespace the CMS preserves around a term's label and slug", () => {
		const padded = term({ slug: " craft ", label: "  Craft  " });

		expect(create([makeArticle({ tags: [padded] })])[0].tags).toEqual([{ name: "Craft", slug: "craft" }]);
	});

	it("maps an article filed under no tag to an empty array rather than undefined", () => {
		expect(create([makeArticle()])[0].tags).toEqual([]);
	});

	it("reads the tag taxonomy alone, so a term filed under another taxonomy never becomes a Tag", () => {
		const article: RawArticle<ArticleReference> = {
			...makeArticle({ tags: [CRAFT] }),
			terms: { tag: [CRAFT], category: [term({ slug: "news" })] },
		};

		expect(create([article])[0].tags).toEqual([{ name: "Craft", slug: "craft" }]);
	});

	it("keeps the tags in the order EmDash hydrated them", () => {
		expect(create([makeArticle({ tags: [TRAVEL, CRAFT] })])[0].tags?.map(({ slug }) => slug)).toEqual([
			"travel",
			"craft",
		]);
	});

	it("reads an article EmDash hydrated no terms for as filed under no tag", () => {
		const article: RawArticle<ArticleReference> = { ...makeArticle(), terms: {} };

		expect(create([article])[0].tags).toEqual([]);
	});
});

describe("createArticles slug", () => {
	it("trims the article's own slug, so the collection is keyed on the string every reference spells", () => {
		expect(create([makeArticle({ slug: "  a-piece  " })])[0].slug).toBe("a-piece");
	});

	it("keys a derived reference on the slug the referenced article carries, however the CMS padded it", () => {
		const [first, second] = create([
			makeArticle({ slug: "first", title: "First", tags: [CRAFT] }),
			makeArticle({ slug: "  second  ", title: "Second", tags: [CRAFT] }),
		]);

		expect(second.slug).toBe("second");
		expect(first.relatedArticles).toEqual([{ id: second.slug, collection: "articles" }]);
	});

	it("keys a hand-picked reference the same way, rather than passing the padding through", () => {
		const [article] = create([
			makeArticle({ relatedArticles: [related("  resolved-one  ")] }),
			makeArticle({ slug: "  resolved-one  " }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "resolved-one", collection: "articles" }]);
	});
});

describe("createArticles content derivations", () => {
	it("builds the table of contents from the headings the renderer collected, keeping their levels", () => {
		const [article] = create([
			makeArticle({
				content: [
					heading({ level: 2, value: "The First Section" }),
					paragraph("Body"),
					heading({ level: 3, value: "A Nested One" }),
				],
			}),
		]);

		expect(article.tableOfContents).toEqual([
			{ id: "the-first-section", heading: "The First Section", level: 2, scope: "--section-1" },
			{ id: "a-nested-one", heading: "A Nested One", level: 3, scope: "--section-2" },
		]);
	});

	it("ignores h1 headings, which are outside the h2-h6 range the table of contents scans", () => {
		expect(create([makeArticle({ content: [heading({ level: 1, value: "Title" })] })])[0].tableOfContents).toEqual([]);
	});

	it("escapes a heading in the body but hands the table of contents the text as authored", () => {
		const [article] = create([makeArticle({ content: [heading({ level: 2, value: "Why & How" })] })]);
		const [entry] = article.tableOfContents;

		expect(entry.heading).toBe("Why & How");
		expect(entry.id).toBe("why-how");
		expect(article.content).toContain(`<a href="#${entry.id}">Why &amp; How</a>`);
	});

	it("numbers each section by the position its entry takes in the table of contents", () => {
		const [article] = create([
			makeArticle({
				content: [
					heading({ level: 1, value: "Title" }),
					heading({ level: 2, value: "First" }),
					heading({ level: 3, value: "Second" }),
				],
			}),
		]);

		for (const entry of article.tableOfContents) {
			expect(article.content).toContain(`<section style="--is: ${entry.scope}">`);
			expect(article.content).toContain(`<h${entry.level} id="${entry.id}"`);
		}

		expect(article.tableOfContents).toHaveLength(2);
	});

	it("counts the words of every paragraph towards reading time, not just the first of each", () => {
		const [article] = create([
			makeArticle({ content: Array.from({ length: 201 }, (_, index) => paragraph(`w${index}`)) }),
		]);

		expect(article.readingTime).toBe(2);
	});

	it("rounds reading time up from two hundred words a minute", () => {
		const words = (count: number) => Array.from({ length: count }, (_, index) => `word${index}`).join(" ");

		expect(create([makeArticle({ content: [paragraph(words(200))] })])[0].readingTime).toBe(1);
		expect(create([makeArticle({ content: [paragraph(words(201))] })])[0].readingTime).toBe(2);
	});
});

describe("createArticles author and batching", () => {
	it("embeds the author without the author's own article references", () => {
		expect(create([makeArticle()])[0].author).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			description: "Content writer",
			jobTitle: "Writer",
			currentCompany: "Freelance",
			profileImage: {
				url: `${MEDIA_FILE_PATH}bianca.webp`,
				details: { width: 1200, height: 630 },
				formats: { avif: false, webp: true },
				shareCrops: expect.any(Array),
			},
			socialNetworks: ["https://linkedin.com/in/bianca"],
		});
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = create([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given", () => {
		const articles = create([makeArticle({ slug: "first" }), makeArticle({ slug: "second" })]);

		expect(articles.map(({ slug }) => slug)).toEqual(["first", "second"]);
	});

	it("credits the author whose own article list names the article, which is how EmDash answers the relation", () => {
		const first = makeArticle({ slug: "first" });
		const second = makeArticle({ slug: "second" });
		const other = rawEntry<AuthorFields, "articles">({
			...AUTHOR,
			slug: "someone-else",
			data: { ...AUTHOR.data, name: "Someone Else" },
			references: { articles: [referenceTo(second)] },
		});

		const [byBianca, byOther] = createArticles({
			rawArticles: [first, second],
			rawAuthors: [crediting([first]), other],
		});

		expect(byBianca.author.name).toBe("Bianca Fiore");
		expect(byOther.author.name).toBe("Someone Else");
	});

	it("refuses the batch by the article rather than emitting one no published author credits", () => {
		expect(() => createArticles({ rawArticles: [makeArticle()], rawAuthors: [AUTHOR] })).toThrow(
			"An Article (an-article) is credited to no published author, so no byline can name it",
		);
	});
});

describe("createArticles republication credit", () => {
	it("refuses an original source the republished flag would have hidden", () => {
		expect(() => create([makeArticle({ isRepublished: false, originalSource: "The Content Standard" })])).toThrow(
			"An Article names an original source (The Content Standard) but is not flagged as republished",
		);
	});
});

describe("createArticle", () => {
	it("maps one article against the whole batch, the way the article page reads its own with its picks", () => {
		const first = makeArticle({ slug: "first", relatedArticles: [related("second")] });
		const second = makeArticle({ slug: "second", title: "Second" });
		const rawArticles = [first, second];

		const article = createArticle({ rawArticle: first, rawArticles, rawAuthors: [crediting(rawArticles)] });

		expect(article).toEqual(create(rawArticles)[0]);
		expect(article.relatedArticles).toEqual([{ id: "second", collection: "articles" }]);
	});

	it("infers related articles for an article read without its picks, as every list reads them", () => {
		const first: RawArticle = { ...makeArticle({ slug: "first", tags: [CRAFT] }), references: {} };
		const second = makeArticle({ slug: "second", tags: [CRAFT] });
		const rawArticles = [first, second];

		const article = createArticle({ rawArticle: first, rawArticles, rawAuthors: [crediting(rawArticles)] });

		expect(article.relatedArticles).toEqual([{ id: "second", collection: "articles" }]);
	});
});
