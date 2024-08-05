import algoliasearch from "algoliasearch/lite";

export const client = algoliasearch(process.env.ALGOLIA_APP_ID as string, process.env.ALGOLIA_API_KEY as string);
