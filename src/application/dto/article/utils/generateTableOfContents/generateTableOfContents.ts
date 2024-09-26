import type { CollectionEntry } from "astro:content";
import { slugify } from "@modules/core/utils/slugify";

type TableOfContentsReturnType = CollectionEntry<"articles">["data"]["tableOfContents"];

const HEADINGS_REGEX = /<h([1-6])>(.*?)<\/h\1>/g;

export function generateTableOfContents(html: string): TableOfContentsReturnType {
	const items: TableOfContentsReturnType = [];
	const headings = html.matchAll(HEADINGS_REGEX);

	for (const heading of headings) {
		const level = Number.parseInt(heading[1]);
		const text = heading[2];
		const id = slugify(text);

		items.push({ id, heading: text, level });
	}

	return items;
}
