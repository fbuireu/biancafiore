import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        featuredImage: z.string().optional(),
    }),
});

export const collections = { articles };
