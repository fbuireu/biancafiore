import type { ImageFormats } from "@domain/shared/image";
import { buildContentfulImageUrl } from "@infrastructure/images/imageOptimization";
import type { Asset, UnresolvedLink } from "contentful";

const PROTOCOL_RELATIVE_PREFIX = "//";
const ASSET_SCHEME = "https:";

const SHARE_CROPS = [
	{ width: 1200, height: 675 },
	{ width: 1200, height: 900 },
	{ width: 1200, height: 1200 },
] as const;

interface CreateImageReturn {
	url: string;
	details: {
		width: number;
		height: number;
	};
	formats: ImageFormats;
	shareCrops: string[];
}

export function createImage(rawImage: Asset<undefined> | UnresolvedLink<"Asset">): CreateImageReturn {
	const asset = rawImage as Asset<undefined>;
	const { contentType, details, url } = asset.fields.file as NonNullable<Asset<undefined>["fields"]["file"]>;

	const absoluteUrl = url.startsWith(PROTOCOL_RELATIVE_PREFIX) ? `${ASSET_SCHEME}${url}` : url;

	return {
		url: absoluteUrl,
		shareCrops: SHARE_CROPS.map(({ width, height }) =>
			buildContentfulImageUrl({ source: absoluteUrl, options: { width, height, fit: "cover" } }),
		),
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
