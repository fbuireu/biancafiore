import * as contentful from "contentful";

export function isContentfulConfigured(): boolean {
	return Boolean(process.env.CONTENTFUL_SPACE_ID);
}

export async function createContentfulClient() {
	const { getSecret } = await import("astro:env/server");
	return contentful.createClient({
		space: getSecret("CONTENTFUL_SPACE_ID") as string,
		accessToken: import.meta.env.DEV
			? (getSecret("CONTENTFUL_PREVIEW_TOKEN") as string)
			: (getSecret("CONTENTFUL_DELIVERY_TOKEN") as string),
		host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
	});
}
