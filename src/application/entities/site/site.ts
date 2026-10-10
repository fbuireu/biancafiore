import { SITE_SETTINGS_ID, siteSettingsSchema } from "@domain/site";
import { fetchSiteSettings } from "@infrastructure/cms/entries";
import { createDefaultSiteSettings, createSiteSettings } from "../../dto/site";
import { contentLoader } from "../collection";

export const site = {
	loader: contentLoader({
		name: "site",
		load: async () => [createSiteSettings(await fetchSiteSettings())],
		identify: () => SITE_SETTINGS_ID,
		loadPrerendered: createDefaultSiteSettings,
	}),
	schema: siteSettingsSchema,
};
