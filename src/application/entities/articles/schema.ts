import { reference, z } from "astro:content";
import { ArticleType } from "@application/dto/article/types.ts";
import { authorSchema } from "@application/entities/authors";
import { tagSchema } from "@application/entities/tags/schema.ts";
import { imageSchema } from "@shared/application/entities";

export const articleSchema = z.object({
    title: z.string(),
    author: authorSchema,
    slug: z.string(),
    description: z.string(),
    publishDate: z.string(),
    featuredImage: imageSchema.optional(),
    isFeaturedArticle: z.boolean(),
    variant: z.enum([ArticleType.NO_IMAGE, ArticleType.DEFAULT]),
    content: z.string(),
    readingTime: z.number(),
    tags: z.array(tagSchema).optional(),
    relatedArticles: z.array(reference("articles")).default([]),
});
