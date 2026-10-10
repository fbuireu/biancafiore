import type { ArticleDTO } from "@domain/article";
import type { ImageDTO } from "@domain/shared/image";
import { mediaFileUrl } from "@infrastructure/cms/media";
import { isSafeImageUrl, isWebUrl } from "../../shared/urls";
import type { ArticleSeoFields } from "../types";

const INDEX = { index: true, follow: true };
const NOINDEX = { index: false, follow: false };

const MEDIA_KEY = /^[\w.-]+(?:\/[\w.-]+)*$/;

const textOf = (value: string | null): string | undefined => value?.trim() || undefined;

function seoImageOf(value: string | null): string | undefined {
	const reference = textOf(value);

	if (!reference) return undefined;

	if (reference.startsWith("/") || isWebUrl(reference)) return isSafeImageUrl(reference) ? reference : undefined;

	return MEDIA_KEY.test(reference) ? mediaFileUrl(reference) : undefined;
}

interface ArticleSeoParams {
	raw: ArticleSeoFields | undefined;
	title: string;
	description: string;
	featuredImage: ImageDTO | undefined;
}

export function articleSeo({ raw, title, description, featuredImage }: ArticleSeoParams): ArticleDTO["seo"] {
	const image = seoImageOf(raw?.image ?? null);

	return {
		title: textOf(raw?.title ?? null) ?? title,
		description: textOf(raw?.description ?? null) ?? description,
		...(image
			? { image }
			: featuredImage && {
					image: featuredImage.url,
					imageWidth: featuredImage.details.width,
					imageHeight: featuredImage.details.height,
				}),
		robots: raw?.noIndex ? NOINDEX : INDEX,
	};
}
