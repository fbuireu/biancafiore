import type { RawTag } from "@application/dto/tag/types";
import type { BaseTagDTO } from "@domain/tag";
import type { UnresolvedLink } from "contentful";

function isResolvedTag(tag: RawTag | UnresolvedLink<"Entry">): tag is RawTag {
	return "fields" in tag;
}

export function createTags(tags: Array<RawTag | UnresolvedLink<"Entry">> | undefined): BaseTagDTO[] {
	return (tags ?? []).filter(isResolvedTag).map((tag) => ({
		name: tag.fields.name.trim(),
		slug: tag.fields.slug.trim(),
	}));
}
