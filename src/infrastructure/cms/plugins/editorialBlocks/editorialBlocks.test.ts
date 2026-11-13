import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { prepareArticleContent } from "@application/dto/article/utils/content";
import type { PortableText } from "@domain/shared/portableText";
import { rawEntry } from "@tests/doubles/cmsEntries";
import { describe, expect, it, vi } from "vitest";
import { EDITORIAL_BLOCK_CONFIGS, EDITORIAL_BLOCK_TYPE, EDITORIAL_BLOCKS } from "./blocks";
import { editorialBlocks } from "./descriptor";
import { requireImageDescriptions } from "./imageDescriptions";
import { createPlugin } from "./plugin";

vi.mock("emdash", () => ({ definePlugin: (definition: unknown) => definition }));

type SampleValues = Record<string, string | boolean>;

const SAMPLE_VALUES: SampleValues = {
	heading: "A heading",
	text: "Some text",
	image: "/_emdash/api/media/file/split.jpg",
	alt: "Described",
	decorative: false,
};

interface BlockOfParams {
	type: string;
	overrides?: SampleValues;
}

const blockOf = ({ type, overrides = {} }: BlockOfParams): PortableText[number] => {
	const config = EDITORIAL_BLOCK_CONFIGS.find((block) => block.type === type);

	return {
		_type: type,
		_key: type,
		...Object.fromEntries((config?.fields ?? []).map(({ action_id }) => [action_id, SAMPLE_VALUES[action_id]])),
		...overrides,
	};
};

const prepare = (block: PortableText[number]): PortableText =>
	prepareArticleContent(
		rawEntry({
			slug: "an-article",
			data: { title: "An article", content: [block], publish_date: "2024-01-01" },
		}) as Parameters<typeof prepareArticleContent>[0],
	).content;

describe("the editorial blocks", () => {
	it("declare only the split block, since a video is EmDash's own iframe block", () => {
		expect(EDITORIAL_BLOCK_CONFIGS.map(({ type }) => type)).toEqual([EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK]);
	});

	it("hand the editor exactly the fields the article reads, so a filled-in split block reaches the page", () => {
		const [split] = prepare(blockOf({ type: EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK }));

		expect(split).toMatchObject({
			_type: EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK,
			heading: "A heading",
			text: "Some text",
			alt: "Described",
			src: expect.stringContaining("/_emdash/api/media/file/split.jpg"),
		});
	});
});

describe("the split block's image fields", () => {
	const field = (id: string) => EDITORIAL_BLOCK_CONFIGS[0]?.fields?.find(({ action_id }) => action_id === id);

	it("offers the decorative choice as a toggle labelled in plain words, off until the editor turns it on, so an empty description is a decision and not a default", () => {
		expect(field("decorative")).toMatchObject({
			type: "toggle",
			label: "Decorative image (no description)",
			initial_value: false,
		});
	});

	it("keeps the description a text input beside it, which the hook that guards publishing reads", () => {
		expect(field("alt")).toMatchObject({ type: "text_input", label: "Image description" });
	});

	it("renders a split block marked decorative with an empty alt, even when the description field still holds text", () => {
		expect(
			prepare(blockOf({ type: EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK, overrides: { decorative: true } }))[0],
		).toMatchObject({
			alt: "",
		});
	});
});

describe("editorialBlocks", () => {
	it("points EmDash at the plugin module by an absolute path with forward slashes, which is all Vite resolves on Windows", () => {
		const { entrypoint } = editorialBlocks();

		expect(isAbsolute(entrypoint)).toBe(true);
		expect(entrypoint).not.toContain("\\");
		expect(entrypoint.endsWith("/plugin.ts")).toBe(true);
		expect(existsSync(entrypoint)).toBe(true);
	});

	it("declares a native plugin carrying the blocks, so the admin offers them without a sandbox", () => {
		expect(editorialBlocks()).toMatchObject({
			id: EDITORIAL_BLOCKS.ID,
			version: EDITORIAL_BLOCKS.VERSION,
			format: "native",
			portableTextBlocks: EDITORIAL_BLOCK_CONFIGS,
		});
	});
});

describe("createPlugin", () => {
	it("registers the same blocks under the same identity the descriptor announced", () => {
		expect(createPlugin()).toMatchObject({
			id: EDITORIAL_BLOCKS.ID,
			version: EDITORIAL_BLOCKS.VERSION,
			admin: { portableTextBlocks: EDITORIAL_BLOCK_CONFIGS },
		});
	});

	it("asks EmDash to run the image description check before a publish and before a schedule, which are the two ways an Article goes live, under the one capability that allows it", () => {
		const { capabilities, hooks } = createPlugin() as unknown as {
			capabilities: string[];
			hooks: Record<string, unknown>;
		};

		expect(capabilities).toStrictEqual(["hooks.content-policy:register"]);
		expect(hooks).toStrictEqual({
			"content:beforePublish": requireImageDescriptions,
			"content:beforeSchedule": requireImageDescriptions,
		});
	});
});
