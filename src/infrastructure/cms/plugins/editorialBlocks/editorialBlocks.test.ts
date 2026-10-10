import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { renderArticleContent } from "@application/dto/article/utils/content";
import { rawEntry } from "@tests/doubles/cmsEntries";
import { describe, expect, it, vi } from "vitest";
import { EDITORIAL_BLOCK_CONFIGS, EDITORIAL_BLOCK_TYPE, EDITORIAL_BLOCKS } from "./blocks";
import { editorialBlocks } from "./descriptor";
import { createPlugin } from "./plugin";

vi.mock("emdash", () => ({ definePlugin: (definition: unknown) => definition }));

const SAMPLE_VALUES: Record<string, string> = {
	url: "https://www.youtube.com/watch?v=abc123",
	title: "A video",
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

const render = (type: string) =>
	renderArticleContent(
		rawEntry({
			slug: "an-article",
			data: { title: "An article", content: [blockOf(type)], publish_date: "2024-01-01" },
		}) as Parameters<typeof renderArticleContent>[0],
	).content;

describe("the editorial blocks", () => {
	it("hand the editor exactly the fields the article renderer reads, so a filled-in video renders", () => {
		const html = render(EDITORIAL_BLOCK_TYPE.VIDEO_EMBED);

		expect(html).toContain("abc123");
		expect(html).toContain('title="A video"');
	});

	it("hand the editor exactly the fields the article renderer reads, so a filled-in split block renders", () => {
		const html = render(EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK);

		expect(html).toContain("<h3>A heading</h3>");
		expect(html).toContain("<p>Some text</p>");
		expect(html).toContain('alt="Described"');
		expect(html).toContain("/_emdash/api/media/file/split.jpg");
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
