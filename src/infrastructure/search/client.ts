import algoliasearch from "algoliasearch/lite";

export const client = algoliasearch(import.meta.env.ALGOLIA_APP_ID, import.meta.env.ALGOLIA_API_KEY);
