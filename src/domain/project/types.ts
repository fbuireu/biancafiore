import type { projectsSchema } from "@domain/project/schema";
import type { z } from "astro/zod";

export type ProjectDTO = z.infer<typeof projectsSchema>;
