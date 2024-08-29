import { defineCollection } from "astro:content";
import { projectDTO } from "@application/dto/project";
import type { RawProject } from "@application/dto/project/types";
import { projectsSchema } from "@application/entities/projects/schema";
import { client } from "@infrastructure/cms/client";

export const projects = defineCollection({
	loader: async () => {
		const { items: rawProjects } = await client.getEntries<RawProject>({
			content_type: "project",
		});

		return projectDTO.create(rawProjects as unknown as RawProject[]);
	},
	schema: projectsSchema,
});
