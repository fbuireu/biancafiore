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

export interface ImageFormats {
	avif: boolean;
	webp: boolean;
}

export interface ContenfulLocation {
	fields: {
		coordinates: {
			lat: number;
			lon: number;
		};
	};
}

export interface Reference<T> {
	id: string;
	collection: T;
}
