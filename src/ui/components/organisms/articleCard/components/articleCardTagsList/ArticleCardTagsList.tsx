import "./article-card-tags-list.css";
import type { ReactNode } from "react";

export interface ArticleCardTagsListProps {
	children: ReactNode;
}

export const ArticleCardTagsList = ({ children }: ArticleCardTagsListProps) => (
	<ul className="article__tags__list flex">{children}</ul>
);
