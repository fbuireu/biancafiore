import type { z } from "astro/zod";
import type { Reference } from "../shared/reference";
import type { authorSchema } from "./schema";

export type AuthorDTO = z.infer<typeof authorSchema> & {
	latestArticle?: Reference<"articles">;
};
