import type { TagDTO } from "@domain/tag";
import type { UnresolvedLink } from "contentful";
import type { RawTag } from "../types";

interface RawTagIdentity {
	sys?: { id?: string };
	fields: { name: string; slug: string };
}

interface RawTagged {
	fields: { tags?: Array<RawTag | UnresolvedLink<"Entry">> };
}

const entryOf = ({ sys }: Pick<RawTagIdentity, "sys">): string => (sys?.id ? ` (sys.id ${sys.id})` : "");

export function tagIdentity(tag: RawTagIdentity): TagDTO {
	const name = tag.fields.name.trim();
	const slug = tag.fields.slug.trim();

	if (!slug) {
		throw new Error(`The Tag "${name}"${entryOf(tag)} has no slug, so no page can address it`);
	}

	if (!name) {
		throw new Error(
			`The Tag "${slug}"${entryOf(tag)} has an empty name, so the Tag Index cannot file it under a letter`,
		);
	}

	return { name, slug };
}

export function articleTagSlugs({ fields }: RawTagged): string[] {
	return (fields.tags ?? []).flatMap((tag) => ("fields" in tag ? [tagIdentity(tag).slug] : []));
}
