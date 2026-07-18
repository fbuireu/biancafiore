export const IMAGE_EMBED_LAYOUT = {
	FULL_BLEED: "fullBleed",
	BREAKOUT: "breakout",
} as const;

type ImageEmbedLayout = (typeof IMAGE_EMBED_LAYOUT)[keyof typeof IMAGE_EMBED_LAYOUT];

const IMAGE_WRAPPER_CLASS: Record<ImageEmbedLayout, string> = {
	[IMAGE_EMBED_LAYOUT.FULL_BLEED]: "full-bleed",
	[IMAGE_EMBED_LAYOUT.BREAKOUT]: "breakout",
};

export function getImageEmbedWrapperClass(layout?: string): string {
	return IMAGE_WRAPPER_CLASS[layout as ImageEmbedLayout] ?? "";
}
