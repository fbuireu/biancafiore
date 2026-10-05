import type { TagDTO } from "@domain/tag";
import type { UnresolvedLink } from "contentful";
import type { RawTag } from "../../tag/types";
import { tagIdentity } from "../../tag/utils/tag";

function isResolvedTag(tag: RawTag | UnresolvedLink<"Entry">): tag is RawTag {
	return "fields" in tag;
}

export function createTags(tags: Array<RawTag | UnresolvedLink<"Entry">> | undefined): TagDTO[] {
	return (tags ?? []).filter(isResolvedTag).map(tagIdentity);
}
