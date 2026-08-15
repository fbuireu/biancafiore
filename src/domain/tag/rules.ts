import { type TagIndexEntryDTO, TagType } from "@domain/tag/types";

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
