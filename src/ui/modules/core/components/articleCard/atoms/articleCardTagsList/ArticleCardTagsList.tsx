import type { ReactNode } from "react";
import "./article-card-tags-list.css";

export interface ArticleCardTagsListProps {
	children: ReactNode;
}

export const ArticleCardTagsList = ({ children }: ArticleCardTagsListProps) => (
	<ul className="article-card__tags__list flex">{children}</ul>
);
