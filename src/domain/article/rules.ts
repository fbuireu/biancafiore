import type { ArticleDTO, TableOfContents } from "@domain/article/types";
import { ArticleType } from "@domain/article/types";
import { slugify } from "@shared/utils/strings";

const WORDS_PER_MINUTE = 200;
const MINIMUM_READING_MINUTES = 1;
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const WHITESPACE_REGEX = /\s+/g;
const HEADINGS_REGEX = /<h([2-6])>(.*?)<\/h\1>/g;
const HEADING_LEVEL_OFFSET = 1;
const MAX_DESCRIPTION_LENGTH = 200;
const HTML_ENTITY_REGEX = /&(?:amp|lt|gt|quot|nbsp|#39);/g;
const DECODED_HTML_ENTITIES: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
	"&nbsp;": "\u00A0",
};

function decodeHtmlEntities(html: string): string {
	return html.replace(HTML_ENTITY_REGEX, (entity) => DECODED_HTML_ENTITIES[entity] ?? entity);
}

export function getReadingTime(content: string): number {
	const cleanContent = content.replace(HTML_TAG_REGEX, " ").trim();
	const numberOfWords = cleanContent.split(WHITESPACE_REGEX).filter(Boolean).length;

	return Math.max(MINIMUM_READING_MINUTES, Math.ceil(numberOfWords / WORDS_PER_MINUTE));
}

export function generateTableOfContents(html: string): TableOfContents {
	const items: TableOfContents = [];
	const headings = html.matchAll(HEADINGS_REGEX);

	for (const heading of headings) {
		const level = Number(heading[1]) - HEADING_LEVEL_OFFSET;
		const text = heading[2];
		const id = slugify(decodeHtmlEntities(text.replace(HTML_TAG_REGEX, "")));

		items.push({ id, heading: text, level });
	}

	return items;
}

export function deriveDescription(rawDescription: string): string {
	const cleanDescription = rawDescription.replace(HTML_TAG_REGEX, " ").replace(WHITESPACE_REGEX, " ").trim();

	return cleanDescription.length > MAX_DESCRIPTION_LENGTH
		? `${cleanDescription.substring(0, MAX_DESCRIPTION_LENGTH)}...`
		: cleanDescription;
}

export function deriveVariant(hasFeaturedImage: boolean): (typeof ArticleType)[keyof typeof ArticleType] {
	return hasFeaturedImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE;
}

export function sortFavoriteFirst(articles: ArticleDTO[]): ArticleDTO[] {
	return articles.toSorted(
		(a, b) => Number(b.isFavorite) - Number(a.isFavorite) || b.publishDateISO.localeCompare(a.publishDateISO),
	);
}
