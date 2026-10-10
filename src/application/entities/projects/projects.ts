import { type ProjectDTO, projectSchema } from "@domain/project";
import { fetchEntries } from "@infrastructure/cms/entries";
import { createProjects } from "../../dto/project";
import type { RawProject } from "../../dto/project/types";
import { contentLoader } from "../collection";

export const projects = {
	loader: contentLoader<ProjectDTO>({
		name: "projects",
		load: async () => {
			const [rawProjects] = await fetchEntries<[RawProject]>({
				collection: "projects",
				orderBy: "created_at",
				order: "asc",
			});

			return createProjects(rawProjects);
		},
		identify: (project) => project.id,
	}),
	schema: projectSchema,
};
