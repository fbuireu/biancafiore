interface ImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'webp' | 'avif' | 'jpg' | 'png';
	fit?: 'fill' | 'crop' | 'pad' | 'thumb' | 'scale';
}

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

export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
	return getContentfulUrl(toAbsoluteSrc(src), options);
}

export function getOptimizedSrcset(
	src: string,
	widths: number[],
	options: Omit<ImageOptions, 'width'> = {},
): string {
	const absoluteSrc = toAbsoluteSrc(src);
	return widths
		.map((w) => `${getContentfulUrl(absoluteSrc, { ...options, width: w })} ${w}w`)
		.join(', ');
}
