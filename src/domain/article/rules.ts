import { DEFAULT_LOCALE_STRING } from "@const/locale";
import { formatDate } from "@shared/utils/dates";
import type { ArticleDTO, ArticleHeading, TableOfContents } from "./types";

const WORDS_PER_MINUTE = 200;
const MINIMUM_READING_MINUTES = 1;
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const HTML_ENTITY_CHARACTERS: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
};
const HTML_ENTITY_REGEX = new RegExp(Object.keys(HTML_ENTITY_CHARACTERS).join("|"), "g");
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
	const cleanDescription = rawDescription
		.replace(HTML_TAG_REGEX, " ")
		.replace(HTML_ENTITY_REGEX, (entity) => HTML_ENTITY_CHARACTERS[entity] ?? entity)
		.replace(WHITESPACE_REGEX, " ")
		.trim();

	return cleanDescription.length > MAX_DESCRIPTION_LENGTH
		? `${cleanDescription.substring(0, MAX_DESCRIPTION_LENGTH)}...`
		: cleanDescription;
}

interface CreditedSourceParams {
	isRepublished: boolean;
	originalSource?: string;
}

export function creditedSource({ isRepublished, originalSource }: CreditedSourceParams): string | undefined {
	if (!isRepublished && originalSource) {
		throw new Error(
			`An Article names an original source (${originalSource}) but is not flagged as republished, so nothing would credit it`,
		);
	}

	return isRepublished ? originalSource : undefined;
}

export function publishDateISO(date: string): string {
	const timestamp = Date.parse(date);

	if (Number.isNaN(timestamp)) {
		throw new Error(`An Article reached the mapper with an unreadable publish date: ${date}`);
	}

	return new Date(timestamp).toISOString();
}

export function formatPublishDate(isoDate: string): string {
	return formatDate(isoDate);
}

export function sortReverseChronological<T extends Pick<ArticleDTO, "publishDateISO">>(articles: T[]): T[] {
	return articles.toSorted((a, b) => b.publishDateISO.localeCompare(a.publishDateISO, DEFAULT_LOCALE_STRING));
}

export function sortFavoriteFirst<T extends Pick<ArticleDTO, "isFavorite" | "publishDateISO">>(articles: T[]): T[] {
	return sortReverseChronological(articles).toSorted((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
}
