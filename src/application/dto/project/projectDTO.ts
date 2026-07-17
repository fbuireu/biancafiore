import type { ProjectDTO, RawProject } from "@application/dto/project/types";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { slugify } from "@modules/core/utils/slugify";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";

export const projectDTO: BaseDTO<RawProject[], ProjectDTO[]> = {
	create: (raw) => {
		return raw.map((rawProject): ProjectDTO => {
			const id = rawProject.fields.id ?? slugify(rawProject.fields.name);

			return {
				id,
				name: rawProject.fields.name,
				description: documentToHtmlString(rawProject.fields.description),
				image: createImage(rawProject.fields.image),
			};
		});
	},
};
