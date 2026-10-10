import type { z } from "@shared/utils/zod";
import type { menuItemSchema, menuSchema } from "./schema";

export type MenuDTO = z.infer<typeof menuSchema>;
export type MenuItemDTO = z.infer<typeof menuItemSchema>;

export const MENU_NAME = {
	HEADER: "header",
	FOOTER: "footer",
} as const;

export type MenuName = (typeof MENU_NAME)[keyof typeof MENU_NAME];
