export interface ImageFormats {
	avif: boolean;
	webp: boolean;
}

export interface Reference<T> {
	id: string;
	collection: T;
}
