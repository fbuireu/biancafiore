import type { PortableTextBlockConfig } from "emdash";

export const EDITORIAL_BLOCKS = {
	ID: "biancafiore-editorial-blocks",
	VERSION: "1.0.0",
} as const;

export const EDITORIAL_BLOCK_TYPE = {
	VIDEO_EMBED: "videoEmbed",
	SPLIT_BLOCK: "splitBlock",
} as const;

export const EDITORIAL_BLOCK_CONFIGS: PortableTextBlockConfig[] = [
	{
		type: EDITORIAL_BLOCK_TYPE.VIDEO_EMBED,
		label: "Video",
		icon: "video",
		description: "A YouTube video, played inside the Article",
		category: "Embeds",
		fields: [
			{ type: "text_input", action_id: "url", label: "Video URL", placeholder: "https://www.youtube.com/watch?v=…" },
			{ type: "text_input", action_id: "title", label: "Title" },
		],
	},
	{
		type: EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK,
		label: "Split block",
		description: "A heading and a paragraph beside an image",
		category: "Sections",
		fields: [
			{ type: "text_input", action_id: "heading", label: "Heading" },
			{ type: "text_input", action_id: "text", label: "Text", multiline: true },
			{ type: "media_picker", action_id: "image", label: "Image" },
			{ type: "text_input", action_id: "alt", label: "Image description" },
		],
	},
];
