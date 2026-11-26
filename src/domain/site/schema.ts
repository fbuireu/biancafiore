import { z } from "@shared/utils/zod";
import { webUrlSchema } from "../shared/url";

export const siteSettingsSchema = z.object({
	title: z.string(),
	description: z.string(),
	socialLinks: z.array(z.object({ name: z.string(), url: webUrlSchema })),
	titleSeparator: z.string(),
	defaultImage: z.object({
		url: z.string(),
		width: z.number().optional(),
		height: z.number().optional(),
	}),
});
