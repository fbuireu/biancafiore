import type { JSX, ReactNode } from "react";
import "./article-card-excerpt.css";

export interface ArticleCardExcerptProps {
	children: ReactNode;
}

export const ArticleCardExcerpt = ({ children }: ArticleCardExcerptProps): JSX.Element => (
	<p className="article-card__excerpt">{children}</p>
);
