import { z } from "@shared/utils/zod";

export const imageSchema = z.object({
	url: z.string(),
	details: z.object({
		width: z.number(),
		height: z.number(),
	}),
	placeholder: z.string().optional(),
});

export type ImageDTO = z.infer<typeof imageSchema>;
