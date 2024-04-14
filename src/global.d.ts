import type { ImageMetadata } from "astro";

declare global {
	type ImageType = Promise<{ default: ImageMetadata }>;
}
