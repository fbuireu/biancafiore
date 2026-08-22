import { defineCollection } from "astro:content";
import { createProjects } from "@application/dto/project";
import type { ProjectSkeleton } from "@application/dto/project/types";
import { withImagePlaceholders } from "@application/entities/placeholders";
import { projectsSchema } from "@domain/project";
import { fetchEntries } from "@infrastructure/cms/entries";

export const projects = defineCollection({
	loader: async () => {
		const [rawProjects] = await fetchEntries<[ProjectSkeleton]>({ content_type: "project" });

		return await withImagePlaceholders("image", createProjects(rawProjects));
	},
	schema: projectsSchema,
});
