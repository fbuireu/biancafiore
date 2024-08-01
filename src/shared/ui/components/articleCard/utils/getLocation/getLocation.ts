const PATHS_MAP = {
	article: "/articles/",
	articles: "/articles",
	about: "/about",
	tag: "/tag",
	tags: "/tags",
	contact: "/contact",
	home: "/",
};

type PathKeys = keyof typeof PATHS_MAP;

export function getLocation(url: URL): PathKeys | undefined {
	return Object.keys(PATHS_MAP).find((key) => url.pathname.includes(PATHS_MAP[key as PathKeys])) as
		| PathKeys
		| undefined;
}
