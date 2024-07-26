import type { BaseTagDTO } from "@application/dto/tag/types.ts";
import type { Entry, EntrySkeletonType } from "contentful";

export function getTags(tags: Array<Entry<EntrySkeletonType<BaseTagDTO>>>): BaseTagDTO[] {
	return tags.map((tag) => ({
		name: tag.fields.name as unknown as string,
		slug: tag.fields.slug as unknown as string,
	}));
}
