import type { ImageDTO } from "@domain/shared/image";
import { imagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { z } from "@shared/utils/zod";

export interface RawImage {
	id: string;
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
	filename?: string;
	provider?: string;
	blurhash?: string | null;
	meta?: Record<string, unknown>;
}

const resolvedImageSchema = z.object({
	src: z.string().min(1),
	width: z.number(),
	height: z.number(),
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

	const { src, width, height } = rawImage;
	const placeholder = imagePlaceholder({ blurhash: blurhashOf(rawImage), width, height });

	return {
		url: src,
		details: { width, height },
		...(placeholder && { placeholder }),
	};
}
