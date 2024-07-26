import type { Asset } from "contentful";

interface FileDetails {
	image: {
		width: number;
		height: number;
	};
}

interface AssetFile {
	url: string;
	details: FileDetails;
}

export type ContentfulImageAsset = Asset & {
	fields: {
		file: AssetFile;
	};
};
