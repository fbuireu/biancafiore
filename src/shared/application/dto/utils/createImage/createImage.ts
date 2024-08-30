import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntrySkeletonType } from "contentful";

interface CreateImageReturnType {
	url: string;
	details: {
		width: number;
		height: number;
	};
}

export function createImage(rawImage: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>): CreateImageReturnType {
	return {
		url: rawImage.fields.file.url as unknown as string,
		details: {
			width: (rawImage as unknown as ContentfulImageAsset).fields.file.details.image.width,
			height: (rawImage as unknown as ContentfulImageAsset).fields.file.details?.image?.height,
		},
	};
}
