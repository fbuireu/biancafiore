import { imageAlt } from "@domain/article";
import { z } from "@shared/utils/zod";
import type { ContentPolicyDecision, ContentPolicyEvent } from "emdash";
import { EDITORIAL_BLOCK_TYPE } from "./blocks";

const DECORATIVE_CHOICE = "Decorative image (no description)";
const MAX_LISTED_BLOCKS = 5;

const BLOCK_LABELS = {
	image: "image",
	[EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK]: "split block",
} as const;

const imageBlockSchema = z.looseObject({
	_type: z.literal("image"),
	alt: z.string().optional(),
	decorative: z.boolean().optional(),
});

const splitImageBlockSchema = z.looseObject({
	_type: z.literal(EDITORIAL_BLOCK_TYPE.SPLIT_BLOCK),
	image: z.string().min(1),
	alt: z.string().optional(),
	decorative: z.boolean().optional(),
});

const bodySchema = z.record(z.string(), z.unknown());

const dataOf = (content: Record<string, unknown>): Record<string, unknown> => {
	const parsed = bodySchema.safeParse(content.data);

	return parsed.success ? parsed.data : {};
};

interface UndescribedLabelParams {
	block: unknown;
	position: number;
}

const undescribedLabel = ({ block, position }: UndescribedLabelParams): string[] => {
	const image = imageBlockSchema.safeParse(block);
	const split = splitImageBlockSchema.safeParse(block);
	const found = image.success ? image : split;

	if (!found.success || imageAlt(found.data) !== undefined) {
		return [];
	}

	return [`block ${position} (${BLOCK_LABELS[found.data._type]})`];
};

function undescribedImages(content: Record<string, unknown>): string[] {
	return Object.values(dataOf(content)).flatMap((field) =>
		Array.isArray(field) ? field.flatMap((block, index) => undescribedLabel({ block, position: index + 1 })) : [],
	);
}

export async function requireImageDescriptions({ content }: ContentPolicyEvent): Promise<ContentPolicyDecision> {
	const missing = undescribedImages(content);

	if (missing.length === 0) {
		return;
	}

	const listed = missing.slice(0, MAX_LISTED_BLOCKS).join(", ");
	const more = missing.length > MAX_LISTED_BLOCKS ? ` and ${missing.length - MAX_LISTED_BLOCKS} more` : "";

	return {
		cancel: true,
		reason: `Describe every image, or choose "${DECORATIVE_CHOICE}", before publishing: ${listed}${more}.`,
	};
}
