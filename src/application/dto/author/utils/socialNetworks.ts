import type { WebUrl } from "@domain/shared/url";
import { isWebUrl } from "../../shared/urls";

const NAME_SEPARATOR = "|";

export function socialNetworkUrls(value: unknown): WebUrl[] {
	if (typeof value !== "string") return [];

	return value.split("\n").flatMap((line) => {
		const url = line.slice(line.lastIndexOf(NAME_SEPARATOR) + 1).trim();

		return isWebUrl(url) ? [url] : [];
	});
}
