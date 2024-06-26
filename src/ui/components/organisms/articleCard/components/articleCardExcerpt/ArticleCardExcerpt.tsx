import "./article-card-excerpt.css";
import type { ReactNode } from "react";

export interface ArticleCardExcerptProps {
	children: ReactNode;
}

export const ArticleCardExcerpt = ({ children }: ArticleCardExcerptProps) => (
	<p className="article__excerpt">{children}</p>
);
