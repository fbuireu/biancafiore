import type { ImageDTO } from "@domain/shared/image";
import { getOptimizedImageUrl } from "@infrastructure/images/imageOptimization";
import { imagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { z } from "@shared/utils/zod";

const SHARE_CROPS = [
	{ width: 1200, height: 675 },
	{ width: 1200, height: 900 },
	{ width: 1200, height: 1200 },
] as const;

export interface RawImage {
	id: string;
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
	mimeType?: string;
	filename?: string;
	provider?: string;
	blurhash?: string | null;
	meta?: Record<string, unknown>;
}

const resolvedImageSchema = z.object({
	src: z.string().min(1),
	width: z.number(),
	height: z.number(),
	mimeType: z.string(),
});

const blurhashOf = ({ blurhash, meta }: RawImage): string | undefined => {
	const stored = blurhash ?? meta?.blurhash;

	return typeof stored === "string" ? stored : undefined;
};

export function createImage(rawImage: RawImage | undefined): ImageDTO {
	if (!resolvedImageSchema.validate(rawImage)) {
		throw new Error(
			`An image reached the mapper without a resolved file and its dimensions (${rawImage?.id ?? "no media at all"}), so nothing can render it`,
		);
	}

	const { src, width, height, mimeType } = rawImage;
	const placeholder = imagePlaceholder({ blurhash: blurhashOf(rawImage), width, height });

	return {
		url: src,
		shareCrops: SHARE_CROPS.map((crop) => getOptimizedImageUrl({ source: src, options: { ...crop, fit: "cover" } })),
		details: { width, height },
		formats: {
			avif: mimeType === "image/avif",
			webp: mimeType === "image/webp",
		},
		...(placeholder && { placeholder }),
	};
}
