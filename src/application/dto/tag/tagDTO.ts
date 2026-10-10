import { resolveSlugCollisions, type TagIndexEntryDTO } from "@domain/tag";
import type { AnyRawArticle } from "../article/types";
import type { RawAuthor } from "../author/types";
import { getAuthors, getTags } from "./utils/tags";

interface CreateTagIndexParams {
	rawArticles: AnyRawArticle[];
	rawAuthors: RawAuthor[];
}

export function createTagIndex({ rawArticles, rawAuthors }: CreateTagIndexParams): TagIndexEntryDTO[] {
	return resolveSlugCollisions([...getTags(rawArticles), ...getAuthors({ rawAuthors, rawArticles })]);
}
