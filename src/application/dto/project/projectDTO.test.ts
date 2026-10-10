import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { rawEntry, rawImage } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import { createProjects } from ".";
import type { ProjectFields } from "./types";

const paragraph = (text: string) => ({
	_type: "block",
	_key: text,
	style: "normal",
	children: [{ _type: "span", _key: `${text}-span`, text, marks: [] }],
	markDefs: [],
});

interface MakeProjectParams extends Partial<ProjectFields> {
	slug?: string | null;
}

const makeProject = ({ slug = null, ...fields }: MakeProjectParams = {}) =>
	rawEntry<ProjectFields>({
		slug,
		data: {
			name: "The Weekly Dispatch",
			description: [paragraph("A newsletter")],
			image: rawImage({ name: "project.jpg", width: 1200, height: 800 }),
			...fields,
		},
	});

describe("createProjects identity", () => {
	it("uses the slug the CMS entry carries", () => {
		expect(createProjects([makeProject({ slug: "weekly-dispatch" })])[0].id).toBe("weekly-dispatch");
	});

	it("falls back to a slug of the name when the entry has none, which a collection with no pages allows", () => {
		expect(createProjects([makeProject({ name: "The Weekly Dispatch" })])[0].id).toBe("the-weekly-dispatch");
	});

	it("falls back the same way for a slug that is only whitespace, rather than keying the collection on it", () => {
		expect(createProjects([makeProject({ slug: "   " })])[0].id).toBe("the-weekly-dispatch");
	});

	it("strips punctuation and diacritics when slugifying the name into an id", () => {
		expect(createProjects([makeProject({ name: "Cafés & Cities: a Guide" })])[0].id).toBe("cafes-cities-a-guide");
	});

	it("leaves the name itself untouched by the slugification", () => {
		expect(createProjects([makeProject()])[0].name).toBe("The Weekly Dispatch");
	});
});

describe("createProjects description", () => {
	it("hands the description to the page as the Portable Text the editor wrote, for EmDash's renderer", () => {
		const description = [paragraph("A newsletter"), paragraph("About cities")];

		expect(createProjects([makeProject({ description })])[0].description).toEqual(description);
	});

	it("hands an empty description on as no blocks at all", () => {
		expect(createProjects([makeProject({ description: [] })])[0].description).toEqual([]);
	});
});

describe("createProjects image and batching", () => {
	it("maps the image to url, pixel dimensions and format flags", () => {
		const [project] = createProjects([
			makeProject({ image: rawImage({ name: "dispatch.avif", mimeType: "image/avif", width: 640, height: 480 }) }),
		]);

		expect(project.image).toEqual({
			url: `${MEDIA_FILE_PATH}dispatch.avif`,
			details: { width: 640, height: 480 },
			formats: { avif: true, webp: false },
			shareCrops: expect.any(Array),
		});
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createProjects([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given", () => {
		const projects = createProjects([makeProject({ slug: "one" }), makeProject({ slug: "two" })]);

		expect(projects.map(({ id }) => id)).toEqual(["one", "two"]);
	});
});
