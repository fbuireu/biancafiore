import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { prepareArticleContent } from "@application/dto/article/utils/content";
import { rawEntry } from "@tests/doubles/cmsEntries";
import { describe, expect, it, vi } from "vitest";
import { EDITORIAL_BLOCK_CONFIGS, EDITORIAL_BLOCK_TYPE, EDITORIAL_BLOCKS } from "./blocks";
import { editorialBlocks } from "./descriptor";
import { createPlugin } from "./plugin";

vi.mock("emdash", () => ({ definePlugin: (definition: unknown) => definition }));

const SAMPLE_VALUES: Record<string, string> = {
	heading: "A heading",
	text: "Some text",
	image: "/_emdash/api/media/file/split.jpg",
	alt: "Described",
};

const blockOf = (type: string) => {
	const config = EDITORIAL_BLOCK_CONFIGS.find((block) => block.type === type);

	return {
		_type: type,
		_key: type,
		...Object.fromEntries((config?.fields ?? []).map(({ action_id }) => [action_id, SAMPLE_VALUES[action_id]])),
	};
};

const prepare = (type: string) =>
	prepareArticleContent(
		rawEntry({
			slug: "an-article",
			data: { title: "An article", content: [blockOf(type)], publish_date: "2024-01-01" },
		}) as Parameters<typeof prepareArticleContent>[0],
	).content;

describe("the editorial blocks", () => {
	it("declare only the split block, since a video is EmDash's own iframe block", () => {
		expect(EDITORIAL_BLOCK_CONFIGS.map(({ type }) => type)).toEqual([EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK]);
	});

	it("hand the editor exactly the fields the article reads, so a filled-in split block reaches the page", () => {
		const [split] = prepare(EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK);

		expect(split).toMatchObject({
			_type: EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK,
			heading: "A heading",
			text: "Some text",
			alt: "Described",
			src: expect.stringContaining("/_emdash/api/media/file/split.jpg"),
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
});
