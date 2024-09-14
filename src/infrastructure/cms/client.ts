import { getSecret } from "astro:env/server";
import contentful from "contentful";

export const client = contentful.createClient({
	space: getSecret("CONTENTFUL_SPACE_ID") as string,
	accessToken: import.meta.env.DEV
		? <string>(getSecret("CONTENTFUL_PREVIEW_TOKEN"))
		: <string>(getSecret("CONTENTFUL_DELIVERY_TOKEN")),
	host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});
