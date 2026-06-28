export type Except<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] };

export interface SeoMetadata {
	title: string;
	description: string;
	site: string;
	robots?: {
		index: boolean;
		follow: boolean;
	};
	image: string;
	imageWidth?: number;
	imageHeight?: number;
	type?: 'website' | 'article';
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	tags?: string[];
}
