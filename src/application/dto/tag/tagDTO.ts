import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import type { RawTag } from "@application/dto/tag/types";
import { getAuthors, getTags } from "@application/dto/tag/utils/tags";
import { resolveSlugCollisions, type TagIndexEntryDTO } from "@domain/tag";

export interface CreateTagIndexParams {
	rawTags: RawTag[];
	rawArticles: RawArticle[];
	rawAuthors: RawAuthor[];
}

export function createTagIndex({ rawTags, rawArticles, rawAuthors }: CreateTagIndexParams): TagIndexEntryDTO[] {
	return resolveSlugCollisions([...getTags({ rawTags, rawArticles }), ...getAuthors({ rawAuthors, rawArticles })]);
}
