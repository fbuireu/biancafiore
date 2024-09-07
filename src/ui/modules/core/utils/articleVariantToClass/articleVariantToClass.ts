import { ArticleType } from "@application/dto/article/types.ts";

const variantClassMap = new Map<ArticleType, string>([
	[ArticleType.DEFAULT, "--default-variant"],
	[ArticleType.NO_IMAGE, "--no-image-variant"],
]);

export function articleVariantToClass(variant: ArticleType) {
	return variantClassMap.get(variant) ?? "--default-variant";
}
