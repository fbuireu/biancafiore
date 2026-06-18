import type { ExternalImageService, ImageTransform } from "astro";

function toAbsoluteSrc(src: string): string {
	return src.startsWith("//") ? `https:${src}` : src;
}

function getSrc(src: ImageTransform["src"]): string {
	return typeof src === "string" ? src : (src as { src: string }).src;
}

/**
 * Production images are resized at the edge with Cloudflare Image Resizing.
 * EmDash stores the originals in R2 and serves them as absolute URLs.
 */
function buildCFUrl(absoluteSrc: string, options: ImageTransform): string {
	const parts: string[] = [`format=${options.format ?? "auto"}`, `quality=${options.quality ?? 85}`];
	if (options.width) parts.push(`width=${options.width}`);
	if (options.height) parts.push(`height=${options.height}`);
	if (options.fit) parts.push(`fit=${options.fit}`);
	return `/cdn-cgi/image/${parts.join(",")}/${absoluteSrc}`;
}

function buildUrl(options: ImageTransform): string {
	const absoluteSrc = toAbsoluteSrc(getSrc(options.src));
	// `/cdn-cgi/image` is unavailable locally; EmDash serves dev media directly.
	if (import.meta.env.DEV) return absoluteSrc;
	return buildCFUrl(absoluteSrc, options);
}

const service: ExternalImageService = {
	validateOptions: (options) => options,

	getURL: (options) => buildUrl(options),

	getSrcSet(options) {
		const widths: number[] = (options as ImageTransform & { widths?: number[] }).widths ?? [];
		return widths.map((width) => ({
			transform: { ...options, width },
			url: buildUrl({ ...options, width }),
			descriptor: `${width}w`,
			attributes: {},
		}));
	},
};

export default service;
