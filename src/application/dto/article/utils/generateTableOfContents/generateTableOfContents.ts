import type { CollectionEntry } from "astro:content";
import { slugify } from "@modules/core/utils/slugify";

type TableOfContentsReturnType = CollectionEntry<"articles">["data"]["tableOfContents"];

const HEADINGS_REGEX = /<h([1-6])>(.*?)<\/h\1>/g;

export function generateTableOfContents(html: string): TableOfContentsReturnType {
	const items: TableOfContentsReturnType = [];
	const matches = html.matchAll(HEADINGS_REGEX);

	for (const match of matches) {
		const level = Number.parseInt(match[1]);
		const heading = match[2];
		const id = slugify(heading);

		items.push({ id, heading, level });
	}

	return items;
}
