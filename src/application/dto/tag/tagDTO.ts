import type { RawTag } from "@application/dto/tag/types";
import { getAuthors, getTags } from "@application/dto/tag/utils/tags";
import type { BaseDTO } from "@domain/shared/baseDTO";
import { resolveSlugCollisions, type TagIndexEntryDTO } from "@domain/tag";
import type { Entry, EntrySkeletonType } from "contentful";

export const tagDTO: BaseDTO<[RawTag[], Entry<EntrySkeletonType>[], Entry<EntrySkeletonType>[]], TagIndexEntryDTO[]> = {
	create: ([raw, rawArticles, rawAuthors]) =>
		resolveSlugCollisions([...getTags({ rawTags: raw, rawArticles }), ...getAuthors({ rawAuthors, rawArticles })]),
};
