import type { ReactNode } from "react";
import "./article-card-title.css";

export interface ArticleCardTitleProps {
	children: ReactNode;
}

export const ArticleCardTitle = ({ children }: ArticleCardTitleProps) => (
	<h3 className="article-card__title font-serif inner-section-title">{children}</h3>
);
