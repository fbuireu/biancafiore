import type { PortableTextBlockConfig } from "emdash";

export const EDITORIAL_BLOCKS = {
	ID: "biancafiore-editorial-blocks",
	VERSION: "1.0.0",
} as const;

export const EDITORIAL_BLOCK_TYPE = {
	SPLIT_BLOCK: "splitBlock",
} as const;

export const EDITORIAL_BLOCK_CONFIGS: PortableTextBlockConfig[] = [
	{
		type: EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK,
		label: "Split block",
		description: "A heading and a paragraph beside an image",
		category: "Sections",
		fields: [
			{ type: "text_input", action_id: "heading", label: "Heading" },
			{ type: "text_input", action_id: "text", label: "Text", multiline: true },
			{ type: "media_picker", action_id: "image", label: "Image" },
			{
				type: "text_input",
				action_id: "alt",
				label: "Image description",
				placeholder: "What the image shows, for readers who cannot see it",
			},
			{
				type: "toggle",
				action_id: "decorative",
				label: "Decorative image (no description)",
				description: "Tick it only when the image adds nothing a reader needs, such as a texture or a divider.",
				initial_value: false,
			},
		],
	},
];
