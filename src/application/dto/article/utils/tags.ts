import type { TagDTO } from "@domain/tag";
import type { RawTag } from "../../tag/types";
import { tagIdentity } from "../../tag/utils/tag";
import { type AnyRawArticle, ARTICLE_TAG_TAXONOMY } from "../types";

export const tagsOf = (rawArticle: AnyRawArticle): RawTag[] => rawArticle.terms[ARTICLE_TAG_TAXONOMY] ?? [];

export function createTags(rawTags: RawTag[]): TagDTO[] {
	return rawTags.map(tagIdentity);
}

export const articleTagSlugs = (rawArticle: AnyRawArticle): string[] =>
	tagsOf(rawArticle).map((tag) => tagIdentity(tag).slug);
