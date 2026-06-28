import { defineCollection } from "astro:content";
import { projectDTO } from "@application/dto/project";
import type { RawProject } from "@application/dto/project/types";
import { projectsSchema } from "@application/entities/projects/schema";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { runCms } from "@infrastructure/runtime";
import { Effect } from "effect";

export const projects = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const { items: rawProjects } = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* cms.getEntries({ content_type: "project" });
			}),
		);

		return projectDTO.create(rawProjects as unknown as RawProject[]);
	},
	schema: projectsSchema,
});
