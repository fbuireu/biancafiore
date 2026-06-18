import type { projectsSchema } from "@application/entities/projects";
import type { EmDashImageField, PortableTextBlock } from "@shared/application/types";
import type { z } from "astro/zod";

/** `data` payload of an EmDash `projects` entry. */
export interface RawProject {
	id?: string;
	name: string;
	description: PortableTextBlock[];
	image?: EmDashImageField;
}

export type ProjectDTO = z.infer<typeof projectsSchema>;
