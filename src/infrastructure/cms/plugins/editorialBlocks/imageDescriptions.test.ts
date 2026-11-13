import type { ContentPolicyEvent } from "emdash";
import { describe, expect, it } from "vitest";
import { requireImageDescriptions } from "./imageDescriptions";

const IMAGE_URL = "/_emdash/api/media/file/photo.jpg";

const eventWith = (data: Record<string, unknown>): ContentPolicyEvent => ({
	collection: "articles",
	content: { id: "01ARTICLE", data },
	origin: { source: "api" },
});

const image = (fields: Record<string, unknown> = {}) => ({
	_type: "image",
	asset: { url: IMAGE_URL },
	...fields,
});

const split = (fields: Record<string, unknown> = {}) => ({ _type: "splitBlock", image: IMAGE_URL, ...fields });

const paragraph = { _type: "block", children: [{ _type: "span", text: "Text" }] };

describe("requireImageDescriptions", () => {
	it("lets an Article through when every image is described or marked decorative", async () => {
		const content = [
			image({ alt: "A lighthouse" }),
			image({ decorative: true }),
			split({ alt: "A harbour" }),
			split({ decorative: true }),
			paragraph,
		];

		expect(await requireImageDescriptions(eventWith({ content }))).toBeUndefined();
	});

	it("cancels the publish of an Article carrying an image with neither, and names where it is, because the editor has to find it", async () => {
		const content = [paragraph, image(), split({ alt: "A harbour" }), split()];

		expect(await requireImageDescriptions(eventWith({ content }))).toStrictEqual({
			cancel: true,
			reason:
				'Describe every image, or choose "Decorative image (no description)", before publishing: block 2 (image), block 4 (split block).',
		});
	});

	it("takes a description of nothing but whitespace, or the decorative toggle left off, for no decision at all", async () => {
		const decision = await requireImageDescriptions(
			eventWith({ content: [image({ alt: "   " }), split({ alt: "", decorative: false })] }),
		);

		expect(decision).toMatchObject({
			cancel: true,
			reason: expect.stringContaining("block 1 (image), block 2 (split block)"),
		});
	});

	it("lists five blocks and counts the rest, so the reason stays short however many images are missing", async () => {
		const decision = await requireImageDescriptions(eventWith({ content: Array.from({ length: 8 }, () => image()) }));

		expect(decision).toMatchObject({ reason: expect.stringMatching(/block 5 \(image\) and 3 more\.$/) });
	});

	it("reads every Portable Text field of the entry, not only the one called content", async () => {
		const decision = await requireImageDescriptions(eventWith({ description: [image()], title: "Not a list" }));

		expect(decision).toMatchObject({ cancel: true });
	});

	it("ignores a split block with no image, since the page drops it, and any entry whose data is not a record", async () => {
		expect(await requireImageDescriptions(eventWith({ content: [split({ image: "" })] }))).toBeUndefined();
		expect(
			await requireImageDescriptions({ collection: "articles", content: { data: null }, origin: { source: "api" } }),
		).toBeUndefined();
	});
});
