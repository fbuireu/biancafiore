import { z } from "@shared/utils/zod";

export const siteSettingsSchema = z.object({
	title: z.string(),
	description: z.string(),
	socialLinks: z.array(z.object({ name: z.string(), url: z.string() })),
	titleSeparator: z.string(),
	defaultImage: z.object({
		url: z.string(),
		width: z.number().optional(),
		height: z.number().optional(),
	}),
});
