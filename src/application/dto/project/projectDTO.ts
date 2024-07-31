import type { ProjectDTO, RawProject } from "@application/dto/project/types.ts";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";

export const projectDTO: BaseDTO<RawProject[], ProjectDTO[]> = {
	render: (raw) => {
		return raw.map((project) => {
			return {
				id: project.fields.id,
				name: project.fields.name,
				description: documentToHtmlString(project.fields.description as unknown as Document),
				image: createImage(project.fields.image),
			} as unknown as ProjectDTO;
		});
	},
};
