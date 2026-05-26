import type { ExternalImageService, ImageTransform } from 'astro';

function toAbsoluteSrc(src: string): string {
	return src.startsWith('//') ? `https:${src}` : src;
}

function getSrc(src: ImageTransform['src']): string {
	return typeof src === 'string' ? src : (src as { src: string }).src;
}

function buildCFUrl(absoluteSrc: string, options: ImageTransform): string {
	const parts: string[] = [
		`format=${options.format ?? 'auto'}`,
		`quality=${options.quality ?? 85}`,
	];
	if (options.width) parts.push(`width=${options.width}`);
	if (options.height) parts.push(`height=${options.height}`);
	if (options.fit) parts.push(`fit=${options.fit}`);
	return `/cdn-cgi/image/${parts.join(',')}/${absoluteSrc}`;
}

function buildContentfulUrl(absoluteSrc: string, options: ImageTransform): string {
	try {
		const url = new URL(absoluteSrc);
		if (options.width) url.searchParams.set('w', String(options.width));
		if (options.height) url.searchParams.set('h', String(options.height));
		if (options.quality) url.searchParams.set('q', String(options.quality));
		const fmt = options.format;
		url.searchParams.set(
			'fm',
			fmt === 'avif' ? 'avif' : fmt === 'jpeg' || fmt === 'jpg' ? 'jpg' : 'webp',
		);
		if (options.fit) url.searchParams.set('fit', options.fit === 'cover' ? 'fill' : options.fit);
		return url.toString();
	} catch {
		return absoluteSrc;
	}
}

function buildUrl(options: ImageTransform): string {
	const absoluteSrc = toAbsoluteSrc(getSrc(options.src));
	if (import.meta.env.DEV) return buildContentfulUrl(absoluteSrc, options);
	return buildCFUrl(absoluteSrc, options);
}

const service: ExternalImageService = {
	validateOptions: (options) => options,

	getURL: (options) => buildUrl(options),

	getSrcSet(options) {
		const widths: number[] =
			(options as ImageTransform & { widths?: number[] }).widths ?? [];
		return widths.map((width) => ({
			transform: { ...options, width },
			url: buildUrl({ ...options, width }),
			descriptor: `${width}w`,
			attributes: {},
		}));
	},
};

export default service;
