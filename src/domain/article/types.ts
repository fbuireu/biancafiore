import type { z } from "astro/zod";
import type { articleSchema } from "./schema";

export type ArticleDTO = z.infer<typeof articleSchema>;

export type TableOfContents = ArticleDTO["tableOfContents"];

export interface ArticleHeading {
	level: number;
	id: string;
	text: string;
	scope: string;
}
