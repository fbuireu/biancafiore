import { CONTENT_ROUTES } from "@const/contentCache";

const DYNAMIC_SEGMENT = /\[[^\]]+\]/g;
const FEED = /\.xml$/;

export const PRERENDERED_PATHS = CONTENT_ROUTES.filter((route) => !FEED.test(route)).map((route) =>
	route.replace(DYNAMIC_SEGMENT, "*"),
);

export const SPECULATION_RULES = JSON.stringify({
	prerender: [{ where: { href_matches: PRERENDERED_PATHS }, eagerness: "moderate" }],
});
