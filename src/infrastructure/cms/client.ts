import { getSecret } from "astro:env/server";
import contentful from "contentful";

export const client = contentful.createClient({
	space: getSecret("CONTENTFUL_SPACE_ID") as string,
	accessToken: import.meta.env.DEV
		? (getSecret("CONTENTFUL_PREVIEW_TOKEN") as string)
		: (getSecret("CONTENTFUL_DELIVERY_TOKEN") as string),
	host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});
