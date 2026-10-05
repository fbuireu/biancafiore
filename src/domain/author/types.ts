import type { z } from "@shared/utils/zod";
import type { authorEntrySchema } from "./schema";

export type AuthorDTO = z.infer<typeof authorEntrySchema>;
