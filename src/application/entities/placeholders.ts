import type { ImageDTO } from "@domain/shared/image";
import { getImagePlaceholders } from "@infrastructure/images/imagePlaceholder";

export type CarriesImage<FIELD extends string> = Partial<Record<FIELD, ImageDTO>>;

interface WithImagePlaceholdersParams<FIELD extends string, ENTRY extends CarriesImage<FIELD>> {
	field: FIELD;
	entries: ENTRY[];
}

export async function withImagePlaceholders<FIELD extends string, ENTRY extends CarriesImage<FIELD>>({
	field,
	entries,
}: WithImagePlaceholdersParams<FIELD, ENTRY>): Promise<ENTRY[]> {
	const placeholders = await getImagePlaceholders(
		entries.flatMap((entry) => {
			const image = entry[field];

			return image ? [image.url] : [];
		}),
	);

	return entries.map((entry) => {
		const image = entry[field];

		if (!image) return entry;

		return { ...entry, [field]: { ...image, placeholder: placeholders.get(image.url) } };
	});
}
