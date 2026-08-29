import { type TagIndexEntryDTO, TagType } from "@domain/tag/types";

interface TagPageCopyParams {
	name: string;
	slug: string;
	type: TagIndexEntryDTO["type"];
}

interface TagPageCopy {
	heading: string;
	title: string;
	description: string;
}

export function tagPageCopy({ name, slug, type }: TagPageCopyParams): TagPageCopy {
	if (type === TagType.AUTHOR) {
		return { heading: name, title: name, description: `Articles written by ${name}.` };
	}

	return { heading: `#${slug}`, title: `#${slug}`, description: `Articles tagged with #${slug}.` };
}
