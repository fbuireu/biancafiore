import { z } from "astro:content";
import { imageSchema } from "@shared/application/entities";

export const authorSchema = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    jobTitle: z.string(),
    currentCompany: z.string(),
    profileImage: imageSchema,
    socialNetworks: z.array(z.string().url()),
});
