import { type TagDTOItem, TagType } from "@application/dto/tag";
import { slugify } from "@shared/ui/utils/slugify";

export function getUniqueTags(tags: TagDTOItem[]): Omit<TagDTOItem, "articles">[] {
	return [...new Set(tags.map(({ name }) => name))].map((name) => {
		const type = tags.find((tag) => tag.name === name)?.type ?? TagType.TAG;
		const count = tags.filter((tag) => tag.name === name).length;
		const slug = slugify(name);

		return { name, type, count, slug };
	});
}
