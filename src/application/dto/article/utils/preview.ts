import type { CmsPreview } from "@infrastructure/cms/entries";
import type { AnyRawArticle } from "../types";

const ARTICLES_COLLECTION = "articles";

interface IsPreviewedParams {
	preview: CmsPreview | undefined;
	rawArticle: AnyRawArticle;
}

export function isPreviewed({ preview, rawArticle }: IsPreviewedParams): boolean {
	return (
		preview?.collection === ARTICLES_COLLECTION && (preview.id === rawArticle.id || preview.id === rawArticle.slug)
	);
}
