import type { ProjectDTO, RawProject } from "@application/dto/project/types.ts";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";

export const projectDTO: BaseDTO<RawProject[], ProjectDTO[]> = {
	render: (raw) => {
		return raw.map((rawProject) => {
			return {
				id: rawProject.fields.id,
				name: rawProject.fields.name,
				description: documentToHtmlString(rawProject.fields.description as unknown as Document),
				image: createImage(rawProject.fields.image),
			} as unknown as ProjectDTO;
		});
	},
};
