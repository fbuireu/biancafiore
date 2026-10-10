import { z } from "@shared/utils/zod";

export const menuItemSchema = z.object({
	label: z.string(),
	href: z.string(),
	before: z.string().optional(),
	after: z.string().optional(),
	opensInNewTab: z.boolean(),
});

export const menuSchema = z.object({
	name: z.string(),
	items: z.array(menuItemSchema),
});
