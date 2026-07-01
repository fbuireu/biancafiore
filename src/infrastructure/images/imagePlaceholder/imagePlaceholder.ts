import { buildContentfulImageUrl } from "@infrastructure/images/imageOptimization";

const PLACEHOLDER_WIDTH = 24;
const PLACEHOLDER_QUALITY = 35;

interface GetImagePlaceholderParams {
	source: string;
}

export async function getImagePlaceholder({ source }: GetImagePlaceholderParams): Promise<string | undefined> {
	try {
		const url = buildContentfulImageUrl({
			source,
			options: { width: PLACEHOLDER_WIDTH, quality: PLACEHOLDER_QUALITY, format: "webp" },
		});
		const response = await fetch(url);
		if (!response.ok) return undefined;

		const buffer = await response.arrayBuffer();

		return `data:image/webp;base64,${Buffer.from(buffer).toString("base64")}`;
	} catch {
		return undefined;
	}
}
