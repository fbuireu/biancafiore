import { resolveSlugCollisions, type TagIndexEntryDTO } from "@domain/tag";
import type { RawArticle } from "../article/types";
import type { RawAuthor } from "../author/types";
import type { RawTag } from "./types";
import { getAuthors, getTags } from "./utils/tags";

interface CreateTagIndexParams {
	rawTags: RawTag[];
	rawArticles: RawArticle[];
	rawAuthors: RawAuthor[];
}

export function createTagIndex({ rawTags, rawArticles, rawAuthors }: CreateTagIndexParams): TagIndexEntryDTO[] {
	return resolveSlugCollisions([...getTags({ rawTags, rawArticles }), ...getAuthors({ rawAuthors, rawArticles })]);
}
