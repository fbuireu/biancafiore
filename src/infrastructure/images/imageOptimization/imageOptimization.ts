import { IMAGE_CDN } from "@const/index";

const CDN_CGI_IMAGE = "/cdn-cgi/image";
const DEFAULT_QUALITY = 85;

type ImageFormat = "auto" | "avif" | "webp" | "jpeg" | "png";
type ImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad";

interface ImageTransformOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: ImageFormat;
	fit?: ImageFit;
}

interface GetOptimizedImageUrlParams {
	source: string;
	options?: ImageTransformOptions;
}

interface GetOptimizedSrcsetParams {
	source: string;
	widths: number[];
	options?: Omit<ImageTransformOptions, "width">;
}

function transformParams(options: ImageTransformOptions): string {
	const params = [`format=${options.format ?? "auto"}`];

	if (options.quality) params.push(`quality=${options.quality}`);
	if (options.width) params.push(`width=${options.width}`);
	if (options.height) params.push(`height=${options.height}`);
	if (options.fit) params.push(`fit=${options.fit}`);

	return params.join(",");
}

const isSameOrigin = (source: string): boolean => source.startsWith("/") && !source.startsWith("//");

export function getOptimizedImageUrl({ source, options = {} }: GetOptimizedImageUrlParams): string {
	if (import.meta.env.IMAGE_CDN !== IMAGE_CDN.CLOUDFLARE || !isSameOrigin(source)) return source;

	const transform = { ...options, quality: options.quality || DEFAULT_QUALITY };

	return `${CDN_CGI_IMAGE}/${transformParams(transform)}/${source.slice(1)}`;
}

export function getOptimizedSrcset({ source, widths, options = {} }: GetOptimizedSrcsetParams): string {
	return widths
		.map((width) => `${getOptimizedImageUrl({ source, options: { ...options, width } })} ${width}w`)
		.join(", ");
}
