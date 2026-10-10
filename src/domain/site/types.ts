import type { z } from "@shared/utils/zod";
import type { siteSettingsSchema } from "./schema";

export type SiteSettingsDTO = z.infer<typeof siteSettingsSchema>;

export const SITE_SETTINGS_ID = "settings";
