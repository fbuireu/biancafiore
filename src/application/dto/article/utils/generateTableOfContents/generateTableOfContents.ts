import type { CollectionEntry } from "astro:content";
import { slugify } from "@modules/core/utils/slugify";

type TableOfContentsReturnType = CollectionEntry<"articles">["data"]["tableOfContents"];

const HEADINGS_REGEX = /<h([2-6])>(.*?)<\/h\1>/g;
const HEADING_LEVEL_OFFSET = 1;

export function generateTableOfContents(html: string): TableOfContentsReturnType {
	const items: TableOfContentsReturnType = [];
	const headings = html.matchAll(HEADINGS_REGEX);

	for (const heading of headings) {
		const level = Number(heading[1]) - HEADING_LEVEL_OFFSET;
		const text = heading[2];
		const id = slugify(text);

		items.push({ id, heading: text, level });
	}

	return items;
}
