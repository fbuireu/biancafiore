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

export interface Image {
	url: string;
	details: {
		width: number;
		height: number;
	};
}

export interface ContenfulLocation {
	fields: {
		coordinates: {
			lat: number;
			lon: number;
		};
	};
}
