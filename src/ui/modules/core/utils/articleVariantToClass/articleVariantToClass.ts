import { ArticleType } from "@application/dto/article/types.ts";

const VARIANT_CLASS_MAP = new Map<ArticleType, string>([
	[ArticleType.DEFAULT, "--default-variant"],
	[ArticleType.NO_IMAGE, "--no-image-variant"],
]);

export function articleVariantToClass(variant: ArticleType): string | undefined {
	return VARIANT_CLASS_MAP.get(variant) ?? VARIANT_CLASS_MAP.get(ArticleType.DEFAULT);
}
