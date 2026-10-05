import type { Except } from "@const/types";
import type { ImageDTO } from "@domain/shared/image";
import { getOriginImageUrl } from "@infrastructure/images/imageOptimization";
import { z } from "astro/zod";
import type { Asset, UnresolvedLink } from "contentful";

const PROTOCOL_RELATIVE_PREFIX = "//";
const ASSET_SCHEME = "https:";

const SHARE_CROPS = [
	{ width: 1200, height: 675 },
	{ width: 1200, height: 900 },
	{ width: 1200, height: 1200 },
] as const;

export const assetFileSchema = z.object({
	url: z.string(),
	details: z
		.object({ image: z.object({ width: z.number().optional(), height: z.number().optional() }).optional() })
		.optional(),
});

const imageAssetSchema = z.object({
	fields: z.object({
		file: assetFileSchema.extend({
			contentType: z.string(),
			details: z.object({
				image: z.object({ width: z.number(), height: z.number() }),
			}),
		}),
	}),
});

export function absoluteAssetUrl(url: string): string {
	return url.startsWith(PROTOCOL_RELATIVE_PREFIX) ? `${ASSET_SCHEME}${url}` : url;
}

export function createImage(rawImage: Asset<undefined> | UnresolvedLink<"Asset">): Except<ImageDTO, "placeholder"> {
	if (!imageAssetSchema.validate(rawImage)) {
		throw new Error(
			`An image asset reached the mapper unresolved, without a file or without its pixel dimensions (${rawImage.sys.id}), so nothing can render it`,
		);
	}

	const { contentType, details, url } = rawImage.fields.file;

	const absoluteUrl = absoluteAssetUrl(url);

	return {
		url: absoluteUrl,
		shareCrops: SHARE_CROPS.map(({ width, height }) =>
			getOriginImageUrl({ source: absoluteUrl, options: { width, height, fit: "cover" } }),
		),
		details: {
			width: details.image.width,
			height: details.image.height,
		},
		formats: {
			avif: contentType === "image/avif",
			webp: contentType === "image/webp",
		},
	};
}
