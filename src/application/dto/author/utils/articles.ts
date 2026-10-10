import { sortReverseChronological } from "@domain/article/rules";
import type { Reference } from "@domain/shared/reference";
import type { AnyRawArticle } from "../../article/types";
import { articlePublishDateISO, articleReference } from "../../article/utils/reference";
import type { RawAuthor } from "../types";
import { credits } from "./author";

interface GetLatestArticleByAuthorParams {
	rawAuthor: RawAuthor;
	rawArticles: AnyRawArticle[];
}

export function getLatestArticleByAuthor({
	rawAuthor,
	rawArticles,
}: GetLatestArticleByAuthorParams): Reference<"articles"> | undefined {
	const [latest] = sortReverseChronological(
		rawArticles
			.filter((rawArticle) => credits({ rawAuthor, rawArticle }))
			.map((article) => ({
				reference: articleReference(article),
				publishDateISO: articlePublishDateISO(article),
			})),
	);

	return latest?.reference;
}
