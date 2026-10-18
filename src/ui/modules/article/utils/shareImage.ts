import { absoluteUrl } from "@const/routes";
import type { ImageDTO } from "@domain/shared/image";

export const SHARE_IMAGE_WIDTH = 1200;

interface ShareImageRequest {
	src: string;
	width: number;
	height: number;
}

type GetImage = (request: ShareImageRequest) => Promise<{ src: string }>;

interface ShareImageParams {
	image: ImageDTO;
	getImage: GetImage;
}

export async function shareImage({ image, getImage }: ShareImageParams): Promise<string> {
	const { width, height } = image.details;
	const shareWidth = Math.min(SHARE_IMAGE_WIDTH, width);
	const { src } = await getImage({
		src: absoluteUrl(image.url),
		width: shareWidth,
		height: Math.round((height * shareWidth) / width),
	});

	return absoluteUrl(src);
}
