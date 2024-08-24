import type { ContentfulImageAsset, Image } from "@shared/application/types";
import type { Entry, EntrySkeletonType } from "contentful";

export function createImage(rawImage: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>): Image {
	return {
		url: rawImage.fields.file.url as unknown as string,
		details: {
			width: (rawImage as unknown as ContentfulImageAsset).fields.file.details.image.width,
			height: (rawImage as unknown as ContentfulImageAsset).fields.file.details?.image?.height,
		},
	};
}
