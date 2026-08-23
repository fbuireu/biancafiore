import { defineCollection } from "astro:content";
import { createProjects } from "@application/dto/project";
import type { ProjectSkeleton } from "@application/dto/project/types";
import { cmsCollection } from "@application/entities/collection";
import { projectsSchema } from "@domain/project";

export const projects = defineCollection({
	loader: cmsCollection<ProjectSkeleton, ReturnType<typeof createProjects>[number], "image">({
		query: { content_type: "project" },
		map: createProjects,
		imageField: "image",
		identify: (project) => project.id,
	}),
	schema: projectsSchema,
});
