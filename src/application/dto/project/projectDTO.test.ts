import { projectDTO } from "@application/dto/project";
import type { RawProject } from "@application/dto/project/types";
import { describe, expect, it } from "vitest";

const text = (value: string) => ({ nodeType: "text", value, marks: [], data: {} });
const paragraph = (value: string) => ({ nodeType: "paragraph", data: {}, content: [text(value)] });
const richText = (content: unknown[]) => ({ nodeType: "document", data: {}, content });

interface AssetParams {
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

const asset = ({
	url = "//images.ctfassets.net/project.jpg",
	contentType = "image/jpeg",
	width = 1200,
	height = 800,
}: AssetParams = {}) => ({
	fields: { file: { url, contentType, details: { size: 4096, image: { width, height } } } },
});

interface MakeProjectParams {
	id?: string;
	name?: string;
	description?: unknown[];
	image?: unknown;
}

const makeProject = ({
	id,
	name = "The Weekly Dispatch",
	description = [paragraph("A newsletter")],
	image = asset(),
}: MakeProjectParams = {}) =>
	({ fields: { id, name, description: richText(description), image } }) as unknown as RawProject;

describe("projectDTO identity", () => {
	it("uses the id the CMS entry declares", () => {
		const [project] = projectDTO.create([makeProject({ id: "weekly-dispatch", name: "The Weekly Dispatch" })]);

		expect(project.id).toBe("weekly-dispatch");
	});

	it("falls back to a slug of the name when the CMS entry has no id", () => {
		const [project] = projectDTO.create([makeProject({ name: "The Weekly Dispatch" })]);

		expect(project.id).toBe("the-weekly-dispatch");
	});

	it("strips punctuation and diacritics when slugifying the name into an id", () => {
		const [project] = projectDTO.create([makeProject({ name: "Cafés & Cities: a Guide" })]);

		expect(project.id).toBe("cafes-cities-a-guide");
	});

	it("keeps an empty authored id, because the fallback is nullish and an empty string is not", () => {
		const [project] = projectDTO.create([makeProject({ id: "", name: "The Weekly Dispatch" })]);

		expect(project.id).toBe("");
	});

	it("leaves the name itself untouched by the slugification", () => {
		const [project] = projectDTO.create([makeProject({ name: "The Weekly Dispatch" })]);

		expect(project.name).toBe("The Weekly Dispatch");
	});
});

describe("projectDTO description", () => {
	it("renders the rich text description to an HTML string, because the domain never sees a Contentful document", () => {
		const [project] = projectDTO.create([
			makeProject({ description: [paragraph("A newsletter"), paragraph("About cities")] }),
		]);

		expect(project.description).toBe("<p>A newsletter</p><p>About cities</p>");
	});

	it("renders an empty document to an empty string", () => {
		const [project] = projectDTO.create([makeProject({ description: [] })]);

		expect(project.description).toBe("");
	});
});

describe("projectDTO image and batching", () => {
	it("maps the image to url, pixel dimensions and format flags", () => {
		const [project] = projectDTO.create([
			makeProject({ image: asset({ url: "//cdn/dispatch.avif", contentType: "image/avif", width: 640, height: 480 }) }),
		]);

		expect(project.image).toEqual({
			url: "//cdn/dispatch.avif",
			details: { width: 640, height: 480 },
			formats: { avif: true, webp: false },
		});
	});

	it("reports undefined dimensions when the asset carries no image details, rather than throwing", () => {
		const withoutDetails = {
			fields: {
				name: "No details",
				description: richText([]),
				image: { fields: { file: { url: "//cdn/file.pdf", contentType: "application/pdf", details: {} } } },
			},
		} as unknown as RawProject;

		const [project] = projectDTO.create([withoutDetails]);

		expect(project.image.details).toEqual({ width: undefined, height: undefined });
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = projectDTO.create([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given", () => {
		const projects = projectDTO.create([makeProject({ id: "one" }), makeProject({ id: "two" })]);

		expect(projects.map(({ id }) => id)).toEqual(["one", "two"]);
	});
});
