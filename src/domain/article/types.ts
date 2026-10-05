import type { z } from "@shared/utils/zod";
import type { articleSchema } from "./schema";

export type ArticleDTO = z.infer<typeof articleSchema>;

export type TableOfContents = ArticleDTO["tableOfContents"];

export interface ArticleHeading {
	level: number;
	id: string;
	text: string;
	scope: string;
}
