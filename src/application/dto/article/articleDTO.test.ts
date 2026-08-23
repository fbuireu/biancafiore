import { createArticles } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({ reference: () => ({ parse: (value: unknown) => value }) }));

const text = (value: string) => ({ nodeType: "text", value, marks: [], data: {} });
const paragraph = (value: string) => ({ nodeType: "paragraph", data: {}, content: [text(value)] });

interface HeadingParams {
	level: number;
	value: string;
}

const heading = ({ level, value }: HeadingParams) => ({
	nodeType: `heading-${level}`,
	data: {},
	content: [text(value)],
});

const richText = (content: unknown[]) => ({ nodeType: "document", data: {}, content });

interface AssetParams {
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

const asset = ({
	url = "//images.ctfassets.net/hero.jpg",
	contentType = "image/jpeg",
	width = 1200,
	height = 630,
}: AssetParams = {}) => ({
	fields: { file: { url, contentType, details: { size: 1024, image: { width, height } } } },
});

const AUTHOR = {
	fields: {
		name: "Bianca Fiore",
		slug: "bianca-fiore",
		description: "Content writer",
		jobTitle: "Writer",
		currentCompany: "Freelance",
		profileImage: asset({ url: "//images.ctfassets.net/bianca.webp", contentType: "image/webp" }),
		socialNetworks: ["https://linkedin.com/in/bianca"],
	},
};

interface TagParams {
	name: string;
	slug: string;
}

const tag = ({ name, slug }: TagParams) => ({ fields: { name, slug } });

interface MakeArticleParams {
	slug?: string;
	title?: string;
	content?: unknown[];
	description?: string;
	publishDate?: string | null;
	updatedAt?: string;
	featuredImage?: unknown;
	featuredArticle?: boolean;
	isFavorite?: boolean;
	isRepublished?: boolean;
	originalSource?: string;
	author?: unknown;
	tags?: unknown[];
	relatedArticles?: unknown[];
}

const makeArticle = ({
	slug = "an-article",
	title = "An article",
	content = [paragraph("Hello world")],
	publishDate = "2024-03-15",
	updatedAt,
	description,
	featuredImage,
	featuredArticle = false,
	isFavorite,
	isRepublished,
	originalSource,
	author = AUTHOR,
	tags,
	relatedArticles,
}: MakeArticleParams = {}) =>
	({
		sys: { updatedAt },
		fields: {
			title,
			slug,
			content: richText(content),
			description,
			publishDate,
			featuredImage,
			featuredArticle,
			isFavorite,
			isRepublished,
			originalSource,
			author,
			tags,
			relatedArticles,
		},
	}) as unknown as RawArticle;

describe("createArticles defaults for optional CMS fields", () => {
	it("defaults isFavorite and isRepublished to false when Contentful omits both flags", () => {
		const [article] = createArticles([makeArticle()]);

		expect(article).toMatchObject({ isFavorite: false, isRepublished: false, originalSource: undefined });
	});

	it("keeps the authored flags when Contentful does send them", () => {
		const [article] = createArticles([
			makeArticle({ isFavorite: true, isRepublished: true, originalSource: "https://medium.com/post" }),
		]);

		expect(article).toMatchObject({
			isFavorite: true,
			isRepublished: true,
			originalSource: "https://medium.com/post",
		});
	});

	it("passes isFeaturedArticle through untouched, since it is a required CMS field with no default", () => {
		const [article] = createArticles([makeArticle({ featuredArticle: true })]);

		expect(article.isFeaturedArticle).toBe(true);
	});
});

describe("createArticles description", () => {
	it("falls back to the rendered content, stripped of markup and collapsed, when there is no description", () => {
		const [article] = createArticles([
			makeArticle({ content: [heading({ level: 2, value: "Intro" }), paragraph("Body text")] }),
		]);

		expect(article.description).toBe("Intro Body text");
	});

	it("truncates a fallback description longer than 200 characters, keeping the opening words verbatim", () => {
		const long = Array.from({ length: 60 }, (_, index) => `word${index}`).join(" ");

		const [article] = createArticles([makeArticle({ content: [paragraph(long)] })]);

		expect(article.description).toBe(`${long.slice(0, 200)}...`);
	});

	it("cleans an authored description rather than trusting the CMS whitespace", () => {
		const [article] = createArticles([makeArticle({ description: "  A   <em>bold</em>\nclaim  " })]);

		expect(article.description).toBe("A bold claim");
	});

	it("keeps an empty authored description, because the fallback is nullish and an empty string is not", () => {
		const [article] = createArticles([makeArticle({ description: "", content: [paragraph("Fallback")] })]);

		expect(article.description).toBe("");
	});
});

describe("createArticles images", () => {
	it("maps a featured image to url, pixel dimensions and format flags", () => {
		const [article] = createArticles([
			makeArticle({ featuredImage: asset({ url: "//cdn/hero.avif", contentType: "image/avif" }) }),
		]);

		expect(article.featuredImage).toEqual({
			url: "https://cdn/hero.avif",
			details: { width: 1200, height: 630 },
			formats: { avif: true, webp: false },
			shareCrops: expect.any(Array),
		});
	});

	it("leaves featuredImage undefined without one", () => {
		const [article] = createArticles([makeArticle()]);

		expect(article.featuredImage).toBeUndefined();
	});
});

describe("createArticles dates", () => {
	it("stores the machine readable date and leaves the label to the renderer", () => {
		const [article] = createArticles([makeArticle({ publishDate: "2024-03-15" })]);

		expect(article.publishDateISO).toBe("2024-03-15T00:00:00.000Z");
		expect(article).not.toHaveProperty("publishDate");
	});

	it.each([
		["missing", null],
		["unreadable", "not a date"],
	])("refuses an entry whose publish date is %s, naming the value rather than throwing bare", (_name, publishDate) => {
		expect(() => createArticles([makeArticle({ publishDate })])).toThrow("unreadable publish date");
	});

	it("reads updatedAt off sys, not off fields", () => {
		const [article] = createArticles([makeArticle({ updatedAt: "2024-04-01T10:00:00.000Z" })]);

		expect(article.updatedAt).toBe("2024-04-01T10:00:00.000Z");
	});

	it("falls back to the publish date when Contentful reports no updatedAt", () => {
		const [article] = createArticles([makeArticle({ publishDate: "2024-03-15" })]);

		expect(article.updatedAt).toBe("2024-03-15T00:00:00.000Z");
	});
});

describe("createArticles related articles", () => {
	it("maps authored related articles to slug references and drops links Contentful left unresolved", () => {
		const [article] = createArticles([
			makeArticle({
				relatedArticles: [{ fields: { slug: "resolved-one" } }, { sys: { type: "Link", linkType: "Entry", id: "x" } }],
			}),
		]);

		expect(article.relatedArticles).toEqual([{ id: "resolved-one", collection: "articles" }]);
	});

	it("treats an empty authored list as an answer and never falls back to the tag matching", () => {
		const sharedTag = tag({ name: "Craft", slug: "craft" });
		const [article] = createArticles([
			makeArticle({ slug: "first", tags: [sharedTag], relatedArticles: [] }),
			makeArticle({ slug: "second", title: "Second", tags: [sharedTag] }),
		]);

		expect(article.relatedArticles).toEqual([]);
	});

	it("derives related articles from a shared tag slug when the CMS field is absent", () => {
		const craft = tag({ name: "Craft", slug: "craft" });
		const travel = tag({ name: "Travel", slug: "travel" });

		const [article] = createArticles([
			makeArticle({ slug: "first", title: "First", tags: [craft] }),
			makeArticle({ slug: "second", title: "Second", tags: [craft, travel] }),
			makeArticle({ slug: "third", title: "Third", tags: [travel] }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "second", collection: "articles" }]);
	});

	it("caps the derived related articles at six", () => {
		const craft = tag({ name: "Craft", slug: "craft" });
		const siblings = Array.from({ length: 9 }, (_, index) =>
			makeArticle({ slug: `sibling-${index}`, title: `Sibling ${index}`, tags: [craft] }),
		);

		const [article] = createArticles([makeArticle({ slug: "first", title: "First", tags: [craft] }), ...siblings]);

		expect(article.relatedArticles).toHaveLength(6);
		expect(article.relatedArticles?.at(0)).toEqual({ id: "sibling-0", collection: "articles" });
	});

	it("leaves an authored list uncapped, because an author who picks eight articles means eight", () => {
		const picks = Array.from({ length: 8 }, (_, index) => ({ fields: { slug: `pick-${index}` } }));

		const [article] = createArticles([makeArticle({ slug: "first", relatedArticles: picks })]);

		expect(article.relatedArticles).toHaveLength(8);
	});

	it("suggests a namesake article, because an article is excluded by its slug and not by its title", () => {
		const craft = tag({ name: "Craft", slug: "craft" });

		const [article] = createArticles([
			makeArticle({ slug: "first", title: "Same title", tags: [craft] }),
			makeArticle({ slug: "namesake", title: "Same title", tags: [craft] }),
		]);

		expect(article.relatedArticles).toEqual([{ id: "namesake", collection: "articles" }]);
	});

	it("drops an authored reference an editor pointed back at the article itself", () => {
		const [article] = createArticles([
			makeArticle({
				slug: "first",
				relatedArticles: [{ fields: { slug: "  first  " } }, { fields: { slug: "second" } }],
			}),
		]);

		expect(article.relatedArticles).toEqual([{ id: "second", collection: "articles" }]);
	});

	it("excludes the article from its own derived list even when it carries its own tags twice over", () => {
		const craft = tag({ name: "Craft", slug: "craft" });

		const [article] = createArticles([makeArticle({ slug: "  first  ", title: "First", tags: [craft, craft] })]);

		expect(article.relatedArticles).toEqual([]);
	});

	it("derives nothing for an article with no tags at all", () => {
		const [article] = createArticles([
			makeArticle({ slug: "first", title: "First" }),
			makeArticle({ slug: "second", title: "Second", tags: [tag({ name: "Craft", slug: "craft" })] }),
		]);

		expect(article.relatedArticles).toEqual([]);
	});
});

describe("createArticles tags", () => {
	it("trims the whitespace Contentful preserves around tag names and slugs", () => {
		const [article] = createArticles([makeArticle({ tags: [tag({ name: "  Craft  ", slug: " craft " })] })]);

		expect(article.tags).toEqual([{ name: "Craft", slug: "craft" }]);
	});

	it("maps a missing tag list to an empty array rather than undefined", () => {
		const [article] = createArticles([makeArticle()]);

		expect(article.tags).toEqual([]);
	});

	it("drops tag links Contentful did not resolve", () => {
		const [article] = createArticles([
			makeArticle({
				tags: [{ sys: { type: "Link", linkType: "Entry", id: "x" } }, tag({ name: "Craft", slug: "craft" })],
			}),
		]);

		expect(article.tags).toEqual([{ name: "Craft", slug: "craft" }]);
	});
});

describe("createArticles slug", () => {
	it("trims the article's own slug, so the collection is keyed on the string every reference spells", () => {
		const [article] = createArticles([makeArticle({ slug: "  a-piece  " })]);

		expect(article.slug).toBe("a-piece");
	});

	it("keys a derived reference on the slug the referenced article carries, however Contentful padded it", () => {
		const craft = tag({ name: "Craft", slug: "craft" });

		const [first, second] = createArticles([
			makeArticle({ slug: "first", title: "First", tags: [craft] }),
			makeArticle({ slug: "  second  ", title: "Second", tags: [craft] }),
		]);

		expect(second.slug).toBe("second");
		expect(first.relatedArticles).toEqual([{ id: second.slug, collection: "articles" }]);
	});

	it("keys an authored reference the same way, rather than passing the padding through", () => {
		const [article] = createArticles([makeArticle({ relatedArticles: [{ fields: { slug: "  resolved-one  " } }] })]);

		expect(article.relatedArticles).toEqual([{ id: "resolved-one", collection: "articles" }]);
	});
});

describe("createArticles content derivations", () => {
	it("builds the table of contents from the headings the renderer collected, shifting levels down by one", () => {
		const [article] = createArticles([
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
		const [article] = createArticles([makeArticle({ content: [heading({ level: 1, value: "Title" })] })]);

		expect(article.tableOfContents).toEqual([]);
	});

	it("wraps every heading in a linked section in the rendered content", () => {
		const [article] = createArticles([makeArticle({ content: [heading({ level: 2, value: "The Craft" })] })]);

		expect(article.content).toContain('<h2 id="the-craft" class="article__heading flex align-baseline">');
		expect(article.content).toContain('<a href="#the-craft">The Craft</a>');
	});

	it("numbers each section by its place in the table of contents, so the scroll timelines line up", () => {
		const [article] = createArticles([
			makeArticle({
				content: [
					heading({ level: 2, value: "First" }),
					heading({ level: 3, value: "Second" }),
					heading({ level: 2, value: "Third" }),
				],
			}),
		]);

		expect(article.tableOfContents).toHaveLength(3);
		expect(article.content).toContain('<section style="--is: --section-1">');
		expect(article.content).toContain('<section style="--is: --section-2">');
		expect(article.content).toContain('<section style="--is: --section-3">');
	});

	it("gives an h1 no timeline, because the table of contents never indexes one", () => {
		const [article] = createArticles([
			makeArticle({ content: [heading({ level: 1, value: "Title" }), heading({ level: 2, value: "First" })] }),
		]);

		expect(article.tableOfContents).toHaveLength(1);
		expect(article.content).toContain("<section>");
		expect(article.content).toContain('<section style="--is: --section-1">');
	});

	it("drops a link whose scheme could execute instead of navigating", () => {
		const scripted = {
			nodeType: "hyperlink",
			data: { uri: "javascript:alert(1)" },
			content: [text("Click me")],
		};

		const [article] = createArticles([makeArticle({ content: [{ ...paragraph("x"), content: [scripted] }] })]);

		expect(article.content).toContain('href=""');
		expect(article.content).not.toContain("javascript:");
	});

	it("wraps a heading in its own section and leaves the body paragraphs alone", () => {
		const [article] = createArticles([
			makeArticle({ content: [heading({ level: 2, value: "The Craft" }), paragraph("Body text")] }),
		]);

		expect(article.content).toContain('<a href="#the-craft">The Craft</a>');
		expect(article.content).toContain("<p>Body text</p>");
		expect(article.content).not.toContain("<p></p>");
	});

	it("points a table of contents entry at an id the rendered content actually defines", () => {
		const [article] = createArticles([
			makeArticle({
				content: [
					{
						nodeType: "heading-2",
						data: {},
						content: [text("Deploying "), { ...text("astro"), marks: [{ type: "code" }] }],
					},
				],
			}),
		]);
		const [entry] = article.tableOfContents;

		expect(entry.id).toBe("deploying-astro");
		expect(article.content).toContain(`<h2 id="${entry.id}"`);
	});

	it("escapes the markup characters an author types into a heading rather than emitting them raw", () => {
		const [article] = createArticles([
			makeArticle({ content: [heading({ level: 2, value: `Why & How <b> "now" isn't it` })] }),
		]);

		expect(article.content).toContain(
			'<a href="#why-how-b-now-isnt-it">Why &amp; How &lt;b&gt; &quot;now&quot; isn&#39;t it</a>',
		);
	});

	it("shows the markup a code block contains instead of running it", () => {
		const codeBlock = {
			nodeType: "embedded-entry-block",
			data: {
				target: { sys: { contentType: { sys: { id: "codeBlock" } } }, fields: { code: '<script>x="1"</script>' } },
			},
			content: [],
		};

		const [article] = createArticles([makeArticle({ content: [codeBlock] })]);

		expect(article.content).toContain("<pre><code>&lt;script&gt;x=&quot;1&quot;&lt;/script&gt;</code></pre>");
		expect(article.content).not.toContain("<script>");
	});

	it("keeps an embedded title inside its attribute when the author typed a quote", () => {
		const videoEmbed = {
			nodeType: "embedded-entry-block",
			data: {
				target: {
					sys: { contentType: { sys: { id: "videoEmbed" } } },
					fields: { url: "https://youtu.be/abc", title: 'She said "hello"' },
				},
			},
			content: [],
		};

		const [article] = createArticles([makeArticle({ content: [videoEmbed] })]);

		expect(article.content).toContain('title="She said &quot;hello&quot;"');
	});

	it("escapes a heading in the body but hands the table of contents the text as authored", () => {
		const [article] = createArticles([makeArticle({ content: [heading({ level: 2, value: "Why & How" })] })]);
		const [entry] = article.tableOfContents;

		expect(entry.heading).toBe("Why & How");
		expect(entry.id).toBe("why-how");
		expect(article.content).toContain(`<a href="#${entry.id}">Why &amp; How</a>`);
	});

	it("spells the anchor once, so an entity in a heading cannot split the id from the link", () => {
		const [article] = createArticles([makeArticle({ content: [heading({ level: 2, value: "Tips & Tricks" })] })]);
		const [entry] = article.tableOfContents;

		expect(entry.id).toBe("tips-tricks");
		expect(article.content).toContain(`<h2 id="${entry.id}"`);
	});

	it("numbers each section by the position its entry takes in the table of contents", () => {
		const [article] = createArticles([
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
		const [article] = createArticles([
			makeArticle({ content: Array.from({ length: 201 }, (_, index) => paragraph(`word${index}`)) }),
		]);

		expect(article.readingTime).toBe(2);
	});

	it("rounds reading time up from two hundred words a minute", () => {
		const words = (count: number) => Array.from({ length: count }, (_, index) => `word${index}`).join(" ");

		const [exactlyOneMinute] = createArticles([makeArticle({ content: [paragraph(words(200))] })]);
		const [oneWordOver] = createArticles([makeArticle({ content: [paragraph(words(201))] })]);

		expect(exactlyOneMinute.readingTime).toBe(1);
		expect(oneWordOver.readingTime).toBe(2);
	});
});

describe("createArticles author and batching", () => {
	it("embeds the author without the author's own article references", () => {
		const [article] = createArticles([makeArticle()]);

		expect(article.author).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			description: "Content writer",
			jobTitle: "Writer",
			currentCompany: "Freelance",
			profileImage: {
				url: "https://images.ctfassets.net/bianca.webp",
				details: { width: 1200, height: 630 },
				formats: { avif: false, webp: true },
				shareCrops: expect.any(Array),
			},
			socialNetworks: ["https://linkedin.com/in/bianca"],
		});
	});

	it("trims the byline slug, so it addresses the same page the author collection generates", () => {
		const [article] = createArticles([
			makeArticle({ author: { fields: { ...AUTHOR.fields, name: " Bianca Fiore ", slug: " bianca-fiore " } } }),
		]);

		expect(article.author).toMatchObject({ name: "Bianca Fiore", slug: "bianca-fiore" });
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createArticles([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given", () => {
		const articles = createArticles([
			makeArticle({ slug: "first", title: "First" }),
			makeArticle({ slug: "second", title: "Second" }),
		]);

		expect(articles.map(({ slug }) => slug)).toEqual(["first", "second"]);
	});
});
