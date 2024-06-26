import "./article-card-excerpt.css";
import type { ReactNode } from "react";

export interface ArticleCardExcerpt {
	children: ReactNode;
}

export const ArticleCardExcerpt = ({ children }: ArticleCardExcerpt) => <p className="article__excerpt">{children}</p>;
