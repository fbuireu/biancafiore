import { PAGES_ROUTES } from "@const/index";
import type { ReactNode } from "react";
import "./article-card-author.css";

export interface ArticleCardAuthorProps {
	children: ReactNode;
	slug: string;
}

export const ArticleCardAuthor = ({ children, slug }: ArticleCardAuthorProps) => (
	<p className={"article-card__author"}>
		by{" "}
		<a href={`${PAGES_ROUTES.TAGS}/${slug}`} className="article-card__author__name --underline-on-hover --is-clickable">
			{children}
		</a>
	</p>
);
