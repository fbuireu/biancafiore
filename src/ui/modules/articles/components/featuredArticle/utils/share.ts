import { absoluteUrl, articleHref } from "@const/index";

const NON_HASHTAG_CHARACTER = /[^\p{L}\p{N}_]/gu;

interface BuildArticleShareLinksParams {
	slug: string;
	title: string;
	tags?: { name: string }[];
}

export interface ArticleShareLinks {
	linkedin: string;
	x: string;
}

export function buildArticleShareLinks({ slug, title, tags }: BuildArticleShareLinksParams): ArticleShareLinks {
	const url = absoluteUrl(articleHref(slug));
	const hashtags = (tags ?? []).map(({ name }) => name.replace(NON_HASHTAG_CHARACTER, "")).filter(Boolean);

	return {
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`,
		x: `https://twitter.com/intent/tweet?${new URLSearchParams({
			url,
			text: title,
			...(hashtags.length > 0 && { hashtags: hashtags.join(",") }),
		})}`,
	};
}
