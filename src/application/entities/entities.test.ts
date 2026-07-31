import { articles } from "@application/entities/articles/articles";
import { authors } from "@application/entities/authors/authors";
import { cities } from "@application/entities/cities/cities";
import { projects } from "@application/entities/projects/projects";
import { tags } from "@application/entities/tags/tags";
import { testimonials } from "@application/entities/testimonials/testimonials";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cmsAnswers, cmsQueries, resetCms } from "../../../tests/doubles/cmsLayer";

vi.mock("astro:content", async () => {
	const { z } = await import("astro/zod");
	const unresolvable = () => {
		throw new Error("reference() is a stub here: a loader test cannot validate entries against the collection schema");
	};

	return { defineCollection: (collection: unknown) => collection, reference: () => z.custom(unresolvable) };
});

vi.mock("@infrastructure/cms/client", async () => {
	const actual = await vi.importActual<typeof import("@infrastructure/cms/client")>("@infrastructure/cms/client");
	const { cmsClientLayer } = await import("../../../tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

type Collection = { loader: () => Promise<Record<string, unknown>[]> };

const COLLECTIONS: [string, unknown][] = [
	["articles", articles],
	["authors", authors],
	["cities", cities],
	["projects", projects],
	["tags", tags],
	["testimonials", testimonials],
];

const load = (collection: unknown) => (collection as Collection).loader();

beforeEach(() => {
	resetCms();
	cmsAnswers({});
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe.each(COLLECTIONS)("%s loader", (_name, collection) => {
	it("returns no entries and asks Contentful for nothing when the credentials are missing", async () => {
		vi.stubEnv("CONTENTFUL_SPACE_ID", undefined);

		await expect(load(collection)).resolves.toEqual([]);
		expect(cmsQueries).toEqual([]);
	});

	it("does reach Contentful once the credentials are there, so the bail is a gate and not a floor", async () => {
		vi.stubEnv("CONTENTFUL_SPACE_ID", "space-id");

		await load(collection);

		expect(cmsQueries.length).toBeGreaterThan(0);
	});
});
