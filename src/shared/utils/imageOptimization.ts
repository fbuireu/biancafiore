interface ImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: "webp" | "avif" | "jpg" | "png" | "auto";
	fit?: "cover" | "contain" | "scale-down" | "crop" | "pad";
}

function toAbsoluteSrc(src: string): string {
	return src.startsWith("//") ? `https:${src}` : src;
}

/**
 * EmDash media is stored in R2 and resized at the edge with Cloudflare Image
 * Resizing (`/cdn-cgi/image/...`) instead of Contentful's Images API query
 * params. The format/quality/width options map onto the CF transform list.
 * @see https://developers.cloudflare.com/images/transform-images/
 */
function getCloudflareImageUrl(src: string, options: ImageOptions): string {
	const transforms: string[] = [
		`format=${options.format === "jpg" ? "jpeg" : (options.format ?? "auto")}`,
		`quality=${options.quality ?? 85}`,
	];

	if (options.width) transforms.push(`width=${options.width}`);
	if (options.height) transforms.push(`height=${options.height}`);
	if (options.fit) transforms.push(`fit=${options.fit}`);

	return `/cdn-cgi/image/${transforms.join(",")}/${src}`;
}

export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
	return getCloudflareImageUrl(toAbsoluteSrc(src), options);
}

export function getOptimizedSrcset(src: string, widths: number[], options: Omit<ImageOptions, "width"> = {}): string {
	const absoluteSrc = toAbsoluteSrc(src);
	return widths.map((w) => `${getCloudflareImageUrl(absoluteSrc, { ...options, width: w })} ${w}w`).join(", ");
}
