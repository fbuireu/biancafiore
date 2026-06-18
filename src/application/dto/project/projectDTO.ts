import { renderPlainContent } from "@application/dto/article/utils/renderOptions";
import type { ProjectDTO, RawProject } from "@application/dto/project/types";
import { slugify } from "@modules/core/utils/slugify";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { EmDashEntry } from "@shared/application/types";

export const projectDTO: BaseDTO<EmDashEntry<RawProject>[], ProjectDTO[]> = {
	create: (raw) => {
		return raw.map((entry): ProjectDTO => {
			const project = entry.data;
			const id = project.id ? project.id : slugify(project.name);

			return {
				id,
				name: project.name,
				description: renderPlainContent(project.description),
				image: createImage(project.image),
			} as unknown as ProjectDTO;
		});
	},
};
