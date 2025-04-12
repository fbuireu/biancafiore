import { ArticleType } from "@application/dto/article/types";

const VARIANT_CLASS_MAP = new Map<(typeof ArticleType)[keyof typeof ArticleType], string>([
	[ArticleType.DEFAULT, "--default-variant"],
	[ArticleType.NO_IMAGE, "--no-image-variant"],
]);

export function articleVariantToClass(variant: (typeof ArticleType)[keyof typeof ArticleType]): string | undefined {
	return VARIANT_CLASS_MAP.get(variant) ?? VARIANT_CLASS_MAP.get(ArticleType.DEFAULT);
}
