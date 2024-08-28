import { defineCollection } from "astro:content";
import { projectDTO } from "@application/dto/project";
import type { RawProject } from "@application/dto/project/types.ts";
import { projectsSchema } from "@application/entities/projects/schema.ts";
import { client } from "@infrastructure/cms/client.ts";

export const projects = defineCollection({
	loader: async () => {
		const { items: rawProjects } = await client.getEntries<RawProject>({
			content_type: "project",
		});

		return projectDTO.create(rawProjects as unknown as RawProject[]);
	},
	schema: projectsSchema,
});
