import type { ContentfulImageAsset, ImageFormats } from "@shared/application/types";
import type { Entry, EntrySkeletonType } from "contentful";

interface CreateImageReturn {
	url: string;
	details: {
		width: number;
		height: number;
	};
	formats: ImageFormats;
}

export function createImage(rawImage: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>): CreateImageReturn {
	const {
		fields: {
			file: { contentType, details, url },
		},
	} = rawImage as unknown as ContentfulImageAsset;

	return {
		url: String(url) as unknown as string,
		details: {
			width: details.image?.width,
			height: details.image?.height,
		},
		formats: {
			avif: contentType === "image/avif",
			webp: contentType === "image/webp",
		},
	};
}
