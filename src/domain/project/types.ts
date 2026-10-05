import type { z } from "@shared/utils/zod";
import type { projectSchema } from "./schema";

export type ProjectDTO = z.infer<typeof projectSchema>;
