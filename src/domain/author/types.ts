import type { z } from "astro/zod";
import type { authorEntrySchema } from "./schema";

export type AuthorDTO = z.infer<typeof authorEntrySchema>;
