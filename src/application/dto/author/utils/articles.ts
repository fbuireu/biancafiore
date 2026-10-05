import { sortReverseChronological } from "@domain/article/rules";
import type { Reference } from "@domain/shared/reference";
import type { ArticleSkeleton, RawArticle } from "../../article/types";
import { articlePublishDateISO, articleReference } from "../../article/utils/reference";
import type { SelectedField } from "../../shared/select";
import { articleAuthorSlug } from "./author";

export const AUTHOR_LATEST_ARTICLE_FIELDS: SelectedField<ArticleSkeleton>[] = [
	"sys.id",
	"fields.slug",
	"fields.publishDate",
	"fields.author",
];

interface GetLatestArticleByAuthorParams {
	authorSlug: string;
	rawArticles: RawArticle[];
}

export function getLatestArticleByAuthor({
	authorSlug,
	rawArticles,
}: GetLatestArticleByAuthorParams): Reference<"articles"> | undefined {
	const [latest] = sortReverseChronological(
		rawArticles
			.filter((article) => articleAuthorSlug(article) === authorSlug)
			.map((article) => ({
				reference: articleReference(article),
				publishDateISO: articlePublishDateISO(article),
			})),
	);

	return latest?.reference;
}
