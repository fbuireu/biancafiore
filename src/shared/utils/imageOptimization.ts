interface ImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'webp' | 'avif' | 'jpg' | 'png';
	fit?: 'fill' | 'crop' | 'pad' | 'thumb' | 'scale';
}

const CLOUDFLARE_FORMAT: Record<NonNullable<ImageOptions['format']>, string> = {
	webp: 'webp',
	avif: 'avif',
	jpg: 'jpeg',
	png: 'png',
};

const CLOUDFLARE_FIT: Record<NonNullable<ImageOptions['fit']>, string> = {
	fill: 'cover',
	crop: 'crop',
	pad: 'pad',
	thumb: 'cover',
	scale: 'scale-down',
};

function toAbsoluteSrc(src: string): string {
	return src.startsWith('//') ? `https:${src}` : src;
}

function getContentfulUrl(src: string, options: ImageOptions): string {
	try {
		const url = new URL(src);
		if (options.width) url.searchParams.set('w', String(options.width));
		if (options.height) url.searchParams.set('h', String(options.height));
		if (options.quality) url.searchParams.set('q', String(options.quality));
		url.searchParams.set('fm', options.format ?? 'webp');
		if (options.fit) url.searchParams.set('fit', options.fit);
		return url.toString();
	} catch {
		return src;
	}
}

function getCloudflareUrl(src: string, options: ImageOptions): string {
	const params: string[] = [
		`format=${options.format ? CLOUDFLARE_FORMAT[options.format] : 'auto'}`,
		`quality=${options.quality ?? 85}`,
	];
	if (options.width) params.push(`width=${options.width}`);
	if (options.height) params.push(`height=${options.height}`);
	if (options.fit) params.push(`fit=${CLOUDFLARE_FIT[options.fit]}`);
	return `/cdn-cgi/image/${params.join(',')}/${src}`;
}

function buildUrl(src: string, options: ImageOptions): string {
	const absoluteSrc = toAbsoluteSrc(src);
	return import.meta.env.DEV
		? getContentfulUrl(absoluteSrc, options)
		: getCloudflareUrl(absoluteSrc, options);
}

export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
	return buildUrl(src, options);
}

export function getOptimizedSrcset(
	src: string,
	widths: number[],
	options: Omit<ImageOptions, 'width'> = {},
): string {
	return widths.map((w) => `${buildUrl(src, { ...options, width: w })} ${w}w`).join(', ');
}
