import type { authorSchema } from "@domain/author/schema";
import type { Reference } from "@domain/shared/reference";
import type { z } from "astro/zod";

export type AuthorDTO = z.infer<typeof authorSchema> & {
	articles: Reference<"articles">[];
	latestArticle?: Reference<"articles">;
};
