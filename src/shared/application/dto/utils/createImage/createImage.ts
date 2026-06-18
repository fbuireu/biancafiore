import type { EmDashImageField, ImageFormats } from "@shared/application/types";

interface CreateImageReturn {
	url: string;
	details: {
		width: number;
		height: number;
	};
	formats: ImageFormats;
}

/**
 * EmDash serves media as absolute `https://` URLs from R2. The rest of the app
 * (templates, image service, Portable Text renderer) prepends `https:` to image
 * URLs — a leftover from Contentful's protocol-relative asset URLs — so we strip
 * the protocol here to keep that contract and avoid touching every consumer.
 */
function toProtocolRelative(url: string): string {
	return url.replace(/^https?:/, "");
}

function detectFormat(url: string): ImageFormats {
	const extension = url.split("?")[0]?.split(".").pop()?.toLowerCase();
	return {
		avif: extension === "avif",
		webp: extension === "webp",
	};
}

export function createImage(rawImage: EmDashImageField | null | undefined): CreateImageReturn {
	const url = rawImage?.url ?? "";

	return {
		url: toProtocolRelative(url),
		details: {
			width: rawImage?.width ?? 0,
			height: rawImage?.height ?? 0,
		},
		formats: detectFormat(url),
	};
}
