import type { ReactNode } from "react";
import "./article-card-author.css";

export interface ArticleCardAuthorProps {
	children: ReactNode;
	slug: string;
}

export const ArticleCardAuthor = ({ children, slug }: ArticleCardAuthorProps) => (
	<p className={"article__author"}>
		by <a href={`/tags/${slug}`}>{children}</a>
	</p>
);
