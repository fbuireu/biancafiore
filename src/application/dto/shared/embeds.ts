const PLAYER_SIZE = { width: 560, height: 315 };
const YOUTUBE_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
const VIMEO_ALLOW = "autoplay; fullscreen; picture-in-picture";
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_PATH = /^\/(?:shorts|live|embed)\/([\w-]{11})\/?$/;
const VIMEO_PATH = /^\/(\d+)\/?$/;

function youTubeId(url: URL): string | undefined {
	if (url.hostname === "youtu.be") return url.pathname.slice(1);
	if (!YOUTUBE_HOSTS.has(url.hostname)) return undefined;

	return url.pathname === "/watch" ? (url.searchParams.get("v") ?? undefined) : YOUTUBE_PATH.exec(url.pathname)?.[1];
}

interface PlayerEmbed {
	src: string;
	width: number;
	height: number;
	allow: string;
	allowFullscreen: true;
}

export function playerEmbed(link: string): PlayerEmbed | undefined {
	if (!URL.canParse(link)) return undefined;

	const url = new URL(link);
	const youtube = youTubeId(url);

	if (youtube && YOUTUBE_ID.test(youtube)) {
		return {
			src: `https://www.youtube.com/embed/${youtube}`,
			...PLAYER_SIZE,
			allow: YOUTUBE_ALLOW,
			allowFullscreen: true,
		};
	}

	const vimeo =
		url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com" ? VIMEO_PATH.exec(url.pathname)?.[1] : undefined;

	return vimeo
		? { src: `https://player.vimeo.com/video/${vimeo}`, ...PLAYER_SIZE, allow: VIMEO_ALLOW, allowFullscreen: true }
		: undefined;
}
