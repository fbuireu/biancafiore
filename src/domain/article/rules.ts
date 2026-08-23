import type { ArticleDTO, ArticleHeading, TableOfContents } from "@domain/article/types";

const WORDS_PER_MINUTE = 200;
const MINIMUM_READING_MINUTES = 1;
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const WHITESPACE_REGEX = /\s+/g;
const TABLE_OF_CONTENTS_LEVELS = [2, 3, 4, 5, 6];
const MAX_DESCRIPTION_LENGTH = 200;

export function getReadingTime(content: string): number {
	const cleanContent = content.replace(HTML_TAG_REGEX, " ").trim();
	const numberOfWords = cleanContent.split(WHITESPACE_REGEX).filter(Boolean).length;

	return Math.max(MINIMUM_READING_MINUTES, Math.ceil(numberOfWords / WORDS_PER_MINUTE));
}

export function isTableOfContentsHeading(level: number): boolean {
	return TABLE_OF_CONTENTS_LEVELS.includes(level);
}

export function generateTableOfContents(headings: ArticleHeading[]): TableOfContents {
	return headings.map(({ id, text, level, scope }) => ({ id, heading: text, level, scope }));
}

export function deriveDescription(rawDescription: string): string {
	const cleanDescription = rawDescription.replace(HTML_TAG_REGEX, " ").replace(WHITESPACE_REGEX, " ").trim();

	return cleanDescription.length > MAX_DESCRIPTION_LENGTH
		? `${cleanDescription.substring(0, MAX_DESCRIPTION_LENGTH)}...`
		: cleanDescription;
}

export function sortFavoriteFirst<T extends Pick<ArticleDTO, "isFavorite" | "publishDateISO">>(articles: T[]): T[] {
	return articles.toSorted(
		(a, b) => Number(b.isFavorite) - Number(a.isFavorite) || b.publishDateISO.localeCompare(a.publishDateISO),
	);
}
