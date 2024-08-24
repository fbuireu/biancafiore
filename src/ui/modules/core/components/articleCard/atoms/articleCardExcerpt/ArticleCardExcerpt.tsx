import type { ReactNode } from "react";
import "./article-card-excerpt.css";

export interface ArticleCardExcerptProps {
	children: ReactNode;
}

export const ArticleCardExcerpt = ({ children }: ArticleCardExcerptProps) => (
	<p className="article__excerpt">{children}</p>
);
