import "./article-card-title.css";
import type { ReactNode } from "react";

export interface ArticleCardTitleProps {
	children: ReactNode;
}

export const ArticleCardTitle = ({ children }: ArticleCardTitleProps) => (
	<h3 className="article__title font-serif inner-section-title">{children}</h3>
);