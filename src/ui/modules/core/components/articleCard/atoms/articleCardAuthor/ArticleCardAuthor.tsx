import { PAGES_ROUTES } from "@const/const.ts";
import type { ReactNode } from "react";
import "./article-card-author.css";

export interface ArticleCardAuthorProps {
	children: ReactNode;
	slug: string;
}

export const ArticleCardAuthor = ({ children, slug }: ArticleCardAuthorProps) => (
	<p className={"article__author"}>
		by{" "}
		<a href={`${PAGES_ROUTES.TAGS}/${slug}`} className="--underline-on-hover">
			{children}
		</a>
	</p>
);
