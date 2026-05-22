import { algoliasearch } from "algoliasearch";

export async function createSearchClient() {
	const { getSecret } = await import("astro:env/server");
	return algoliasearch(getSecret("ALGOLIA_APP_ID") as string, getSecret("ALGOLIA_API_KEY") as string);
}
