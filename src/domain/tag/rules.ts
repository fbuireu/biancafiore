import { type TagIndexBucket, type TagIndexEntryDTO, TagType } from "@domain/tag/types";

export function resolveSlugCollisions(entries: TagIndexEntryDTO[]): TagIndexEntryDTO[] {
	const addressed = new Map<string, TagIndexEntryDTO>();

	for (const entry of entries) {
		const claimant = addressed.get(entry.slug);
		const yields = claimant?.type === TagType.AUTHOR && entry.type === TagType.TAG;

		if (!claimant || yields) {
			addressed.set(entry.slug, entry);
		}
	}

	return [...addressed.values()];
}

export function buildTagIndexBuckets(entries: TagIndexEntryDTO[]): TagIndexBucket[] {
	const grouped = Object.groupBy(entries, ({ name }) => name.charAt(0).toUpperCase());

	return Object.entries(grouped)
		.map(([letter, bucket]) => ({
			letter,
			entries: (bucket ?? []).toSorted((first, second) => first.name.localeCompare(second.name)),
		}))
		.toSorted((first, second) => first.letter.localeCompare(second.letter));
}
