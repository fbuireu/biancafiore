import { defineCollection } from "astro:content";
import { projectSchema } from "@domain/project";
import { createProjects } from "../../dto/project";
import type { ProjectSkeleton } from "../../dto/project/types";
import { cmsCollection } from "../collection";

export const projects = defineCollection({
	loader: cmsCollection<ProjectSkeleton, ReturnType<typeof createProjects>[number], "image">({
		query: { content_type: "project" },
		map: createProjects,
		imageField: "image",
		identify: (project) => project.id,
	}),
	schema: projectSchema,
});
