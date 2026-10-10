import { CmsError } from "@infrastructure/errors";
import { rawEntry, rawImage, term } from "@tests/doubles/cmsEntries";
import { cmsAnswers, cmsFailsWith, cmsQueries, resetCms } from "@tests/doubles/cmsLayer";
import type { LiveLoader } from "astro/loaders";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleFields } from "../dto/article/types";
import type { CityFields } from "../dto/city/types";
import type { ProjectFields } from "../dto/project/types";
import type { TestimonialFields } from "../dto/testimonial/types";
import { articles } from "./articles/articles";
import { authors } from "./authors/authors";
import { cities } from "./cities/cities";
import { projects } from "./projects/projects";
import { tags } from "./tags/tags";
import { testimonials } from "./testimonials/testimonials";

vi.mock("@infrastructure/cms/client", async () => {
	const actual = await vi.importActual<typeof import("@infrastructure/cms/client")>("@infrastructure/cms/client");
	const { cmsClientLayer } = await import("@tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

interface Collection {
	loader: LiveLoader<Record<string, unknown>, { id: string }>;
	schema: unknown;
}

const COLLECTIONS: [string, Collection][] = [
	["articles", articles as unknown as Collection],
	["authors", authors as unknown as Collection],
	["cities", cities as unknown as Collection],
	["projects", projects as unknown as Collection],
	["tags", tags as unknown as Collection],
	["testimonials", testimonials as unknown as Collection],
];

beforeEach(() => {
	resetCms();
	cmsAnswers({});
});

describe.each(COLLECTIONS)("%s loader", (name, { loader, schema }) => {
	it("reads the CMS on every load, since a page asks for its content when it is requested", async () => {
		await expect(loader.loadCollection({ collection: name })).resolves.toEqual({ entries: [] });
		expect(cmsQueries.length).toBeGreaterThan(0);
	});

	it("answers a CMS failure as data, so the page that asked decides how to fail", async () => {
		cmsFailsWith(new CmsError({ message: "emdash is unreachable" }));

		const result = await loader.loadCollection({ collection: name });

		expect(result).toEqual({
			error: expect.objectContaining({ message: expect.stringContaining("emdash is unreachable") }),
		});
	});

	it("answers a failure reading one entry as data too", async () => {
		cmsFailsWith(new CmsError({ message: "emdash is unreachable" }));

		const result = await loader.loadEntry({ filter: { id: "anything" }, collection: name });

		expect(result).toEqual({
			error: expect.objectContaining({ message: expect.stringContaining("emdash is unreachable") }),
		});
	});

	it("answers no entry for an id the CMS does not hold, which the page turns into a 404", async () => {
		await expect(loader.loadEntry({ filter: { id: "nothing-here" }, collection: name })).resolves.toBeUndefined();
	});

	it("names itself and declares the schema Astro validates each entry against", () => {
		expect(loader.name).toBe(name);
		expect(schema).toBeDefined();
	});
});

describe("tags loader", () => {
	it("keys a tag by its slug and finds it by that slug alone", async () => {
		cmsAnswers({
			articles: [
				rawEntry<ArticleFields>({
					id: "article-first",
					slug: "first",
					terms: { tag: [term({ slug: "craft", label: "Craft" })] },
					data: { title: "First", content: [], publish_date: "2024-01-01" },
				}),
			],
			authors: [],
		});

		const entry = await tags.loader.loadEntry({ filter: { id: "craft" }, collection: "tags" });

		expect(entry).toMatchObject({ id: "craft", data: { name: "Craft", type: "tag" } });
	});
});

describe.each([
	[
		"cities",
		"by the City's name",
		cities as unknown as Collection,
		rawEntry<CityFields>({
			data: {
				name: "Barcelona",
				latitude: 41.39,
				longitude: 2.16,
				start_date: "2015-01-01T00:00:00.000Z",
				description: "Where the writing started.",
				image: rawImage(),
			},
		}),
		"Barcelona",
	],
	[
		"projects",
		"by the Project's slug",
		projects as unknown as Collection,
		rawEntry<ProjectFields>({ slug: "web-content", data: { name: "Web Content", description: [], image: rawImage() } }),
		"web-content",
	],
	[
		"testimonials",
		"by who gave the Testimonial",
		testimonials as unknown as Collection,
		rawEntry<TestimonialFields>({
			data: { author: "Ada Lovelace", quote: "A quote", role: "Engineer", image: rawImage() },
		}),
		"Ada Lovelace",
	],
])("%s loader", (name, identity, { loader }, raw, id) => {
	it(`keys an entry ${identity}, and finds it by that key alone`, async () => {
		cmsAnswers({ [name]: [raw] });

		await expect(loader.loadCollection({ collection: name })).resolves.toMatchObject({ entries: [{ id }] });
		await expect(loader.loadEntry({ filter: { id }, collection: name })).resolves.toMatchObject({ id });
	});
});
