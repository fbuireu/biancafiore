import { withImagePlaceholders } from "@application/entities/placeholders";
import type { ImageDTO } from "@domain/shared/image";
import type { EntriesQuery } from "@infrastructure/cms/client";
import { fetchEntries } from "@infrastructure/cms/entries";
import type { EntryCollection, EntrySkeletonType } from "contentful";

type CarriesImage<FIELD extends string> = Partial<Record<FIELD, ImageDTO>>;

type RawItems<SKELETON extends EntrySkeletonType> = EntryCollection<SKELETON, undefined>["items"];

interface CmsCollectionParams<
	SKELETON extends EntrySkeletonType,
	ENTRY extends CarriesImage<FIELD>,
	FIELD extends string,
> {
	query: NonNullable<EntriesQuery>;
	map: (raw: RawItems<SKELETON>) => ENTRY[];
	identify: (entry: ENTRY) => string;
	imageField?: FIELD;
	order?: (entries: ENTRY[]) => ENTRY[];
}

export function cmsCollection<
	SKELETON extends EntrySkeletonType,
	ENTRY extends CarriesImage<FIELD>,
	FIELD extends string,
>({ query, map, identify, imageField, order }: CmsCollectionParams<SKELETON, ENTRY, FIELD>) {
	return async () => {
		const [raw] = await fetchEntries<[SKELETON]>(query);
		const mapped = order ? order(map(raw)) : map(raw);
		const entries = imageField ? await withImagePlaceholders({ field: imageField, entries: mapped }) : mapped;

		return entries.map((entry) => ({ ...entry, id: identify(entry) }));
	};
}
