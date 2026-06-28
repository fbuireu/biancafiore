const CDN_CGI_IMAGE = "/cdn-cgi/image";
const CDN_CGI_IMAGE_PATTERN = /^\/cdn-cgi\/image\/([^/]+)\/(https?:\/\/.+)$/;
const DEFAULT_QUALITY = 85;

const CONTENTFUL_FORMAT = {
	avif: "avif",
	webp: "webp",
	jpeg: "jpg",
	png: "png",
} as const;

const CONTENTFUL_FIT = {
	"scale-down": "scale",
	contain: "thumb",
	cover: "fill",
	crop: "crop",
	pad: "pad",
} as const;

type ImageFormat = "auto" | keyof typeof CONTENTFUL_FORMAT;
type ImageFit = keyof typeof CONTENTFUL_FIT;

export interface ImageTransformOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: ImageFormat;
	fit?: ImageFit;
}

const OPTION_PARSERS: { [K in keyof ImageTransformOptions]-?: (value: string) => ImageTransformOptions[K] } = {
	width: Number,
	height: Number,
	quality: Number,
	format: (value) => value as ImageFormat,
	fit: (value) => value as ImageFit,
};

interface GetOptimizedImageUrlParams {
	source: string;
	options?: ImageTransformOptions;
}

interface GetOptimizedSrcsetParams {
	source: string;
	widths: number[];
	options?: Omit<ImageTransformOptions, "width">;
}

interface BuildContentfulImageUrlParams {
	source: string;
	options?: ImageTransformOptions;
}

function toAbsoluteSrc(source: string): string {
	return source.startsWith("//") ? `https:${source}` : source;
}

export function getOptimizedImageUrl({ source, options = {} }: GetOptimizedImageUrlParams): string {
	const params = [`format=${options.format ?? "auto"}`, `quality=${options.quality ?? DEFAULT_QUALITY}`];
	if (options.width) params.push(`width=${options.width}`);
	if (options.height) params.push(`height=${options.height}`);
	if (options.fit) params.push(`fit=${options.fit}`);

	return `${CDN_CGI_IMAGE}/${params.join(",")}/${toAbsoluteSrc(source)}`;
}

export function getOptimizedSrcset({ source, widths, options = {} }: GetOptimizedSrcsetParams): string {
	return widths.map((width) => `${getOptimizedImageUrl({ source, options: { ...options, width } })} ${width}w`).join(", ");
}

export function buildContentfulImageUrl({ source, options = {} }: BuildContentfulImageUrlParams): string {
	try {
		const url = new URL(toAbsoluteSrc(source));
		if (options.width) url.searchParams.set("w", String(options.width));
		if (options.height) url.searchParams.set("h", String(options.height));
		if (options.quality) url.searchParams.set("q", String(options.quality));
		if (options.format && options.format !== "auto") url.searchParams.set("fm", CONTENTFUL_FORMAT[options.format]);
		if (options.fit) url.searchParams.set("fit", CONTENTFUL_FIT[options.fit]);

		return url.toString();
	} catch {
		return source;
	}
}

export function parseCloudflareImageUrl(pathname: string): { source: string; options: ImageTransformOptions } | null {
	const match = pathname.match(CDN_CGI_IMAGE_PATTERN);
	if (!match) return null;

	const [, rawOptions, source] = match;
	const rawParams = new Map(rawOptions.split(",").map((part) => part.split("=") as [string, string]));
	const options: ImageTransformOptions = {};
	for (const key of Object.keys(OPTION_PARSERS) as (keyof ImageTransformOptions)[]) {
		const value = rawParams.get(key);
		if (value !== undefined) Object.assign(options, { [key]: OPTION_PARSERS[key](value) });
	}

	return { source, options };
}
