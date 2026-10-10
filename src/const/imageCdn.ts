export const IMAGE_CDN = {
	CLOUDFLARE: "cloudflare",
	NONE: "none",
} as const;

export type ImageCdn = (typeof IMAGE_CDN)[keyof typeof IMAGE_CDN];
