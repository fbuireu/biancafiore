import { getSecret } from "astro:env/server";
import { algoliasearch } from "algoliasearch";

export const client = algoliasearch(<string>getSecret("ALGOLIA_APP_ID"), <string>getSecret("ALGOLIA_API_KEY"));
