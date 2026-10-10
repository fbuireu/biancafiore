import type { TagDTO } from "@domain/tag";
import type { RawTag } from "../types";

type RawTagIdentity = Pick<RawTag, "label" | "slug"> & Partial<Pick<RawTag, "id">>;

const entryOf = ({ id }: RawTagIdentity): string => (id ? ` (id ${id})` : "");

export function tagIdentity(tag: RawTagIdentity): TagDTO {
	const name = tag.label.trim();
	const slug = tag.slug.trim();

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
