const NAME_SEPARATOR = "|";
const WEB_PROTOCOLS = new Set(["http:", "https:"]);

const isWebUrl = (url: string): boolean => URL.canParse(url) && WEB_PROTOCOLS.has(new URL(url).protocol);

export function socialNetworkUrls(value: unknown): string[] {
	if (typeof value !== "string") return [];

	return value.split("\n").flatMap((line) => {
		const url = line.slice(line.lastIndexOf(NAME_SEPARATOR) + 1).trim();

		return isWebUrl(url) ? [url] : [];
	});
}
