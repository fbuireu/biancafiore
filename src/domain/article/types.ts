import type { articleSchema } from "@domain/article/schema";
import type { z } from "astro/zod";

export const ArticleType = {
	DEFAULT: "default",
	NO_IMAGE: "no_image",
} as const;

export type ArticleDTO = z.infer<typeof articleSchema>;

export type TableOfContents = ArticleDTO["tableOfContents"];

export interface ArticleHeading {
	level: number;
	id: string;
	text: string;
}
