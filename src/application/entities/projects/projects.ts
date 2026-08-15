import { defineCollection } from "astro:content";
import { projectDTO } from "@application/dto/project";
import type { ProjectSkeleton } from "@application/dto/project/types";
import { projectsSchema } from "@domain/project";
import { fetchEntries } from "@infrastructure/cms/entries";
import { getImagePlaceholder } from "@infrastructure/images/imagePlaceholder";

export const projects = defineCollection({
	loader: async () => {
		const [rawProjects] = await fetchEntries<[ProjectSkeleton]>({ content_type: "project" });

		const projects = projectDTO.create(rawProjects);

		return Promise.all(
			projects.map(async (project) => ({
				...project,
				image: { ...project.image, placeholder: await getImagePlaceholder({ source: project.image.url }) },
			})),
		);
	},
	schema: projectsSchema,
});
