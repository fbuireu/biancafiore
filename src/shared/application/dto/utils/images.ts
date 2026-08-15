import type { ImageFormats } from "@domain/shared/image";
import type { Asset, UnresolvedLink } from "contentful";

const PROTOCOL_RELATIVE_PREFIX = "//";
const ASSET_SCHEME = "https:";

interface CreateImageReturn {
	url: string;
	details: {
		width: number;
		height: number;
	};
	formats: ImageFormats;
}

export function createImage(rawImage: Asset<undefined> | UnresolvedLink<"Asset">): CreateImageReturn {
	const asset = rawImage as Asset<undefined>;
	const { contentType, details, url } = asset.fields.file as NonNullable<Asset<undefined>["fields"]["file"]>;

	return {
		url: url.startsWith(PROTOCOL_RELATIVE_PREFIX) ? `${ASSET_SCHEME}${url}` : url,
		details: {
			width: details.image?.width as number,
			height: details.image?.height as number,
		},
		formats: {
			avif: contentType === "image/avif",
			webp: contentType === "image/webp",
		},
	};
}
