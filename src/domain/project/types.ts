import type { z } from "astro/zod";
import type { projectSchema } from "./schema";

export type ProjectDTO = z.infer<typeof projectSchema>;
