interface CloudflareImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'auto' | 'webp' | 'avif' | 'jpeg';
	fit?: 'cover' | 'contain' | 'scale-down' | 'crop' | 'pad';
}

function toAbsoluteSrc(src: string): string {
	return src.startsWith('//') ? `https:${src}` : src;
}

function buildCFParams(options: CloudflareImageOptions): string {
	const parts: string[] = [
		`format=${options.format ?? 'auto'}`,
		`quality=${options.quality ?? 85}`,
	];
	if (options.width) parts.push(`width=${options.width}`);
	if (options.height) parts.push(`height=${options.height}`);
	if (options.fit) parts.push(`fit=${options.fit}`);
	return parts.join(',');
}

function getContentfulOptimizedUrl(src: string, options: CloudflareImageOptions): string {
	try {
		const url = new URL(src);
		if (options.width) url.searchParams.set('w', String(options.width));
		if (options.height) url.searchParams.set('h', String(options.height));
		if (options.quality) url.searchParams.set('q', String(options.quality));
		url.searchParams.set('fm', 'webp');
		if (options.fit) url.searchParams.set('fit', options.fit === 'cover' ? 'fill' : options.fit);
		return url.toString();
	} catch {
		return src;
	}
}

export function getOptimizedImageUrl(src: string, options: CloudflareImageOptions = {}): string {
	const absoluteSrc = toAbsoluteSrc(src);

	if (import.meta.env.DEV) {
		return getContentfulOptimizedUrl(absoluteSrc, options);
	}

	return `/cdn-cgi/image/${buildCFParams(options)}/${absoluteSrc}`;
}

export function getOptimizedSrcset(
	src: string,
	widths: number[],
	options: Omit<CloudflareImageOptions, 'width'> = {},
): string {
	const absoluteSrc = toAbsoluteSrc(src);

	if (import.meta.env.DEV) {
		return widths
			.map((w) => `${getContentfulOptimizedUrl(absoluteSrc, { ...options, width: w })} ${w}w`)
			.join(', ');
	}

	return widths
		.map((w) => `/cdn-cgi/image/${buildCFParams({ ...options, width: w })}/${absoluteSrc} ${w}w`)
		.join(', ');
}
