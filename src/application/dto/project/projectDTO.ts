import type { RawProject } from "@application/dto/project/types";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { ProjectDTO } from "@domain/project";
import { createImage } from "@shared/application/dto/utils/images";
import { slugify } from "@shared/utils/strings";

export function createProjects(raw: RawProject[]): ProjectDTO[] {
	return raw.map((rawProject): ProjectDTO => {
		const id = rawProject.fields.id ?? slugify(rawProject.fields.name);

		return {
			id,
			name: rawProject.fields.name,
			description: documentToHtmlString(rawProject.fields.description),
			image: createImage(rawProject.fields.image),
		};
	});
}
