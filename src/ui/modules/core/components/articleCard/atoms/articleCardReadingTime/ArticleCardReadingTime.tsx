import type { ReactNode } from "react";
import "./article-card-reading-time.css";

export interface ArticleCardReadingTimeProps {
	children: ReactNode;
}

export const ArticleCardReadingTime = ({ children }: ArticleCardReadingTimeProps) => (
	<p className={"article-card__reading-time"}>{children}</p>
);
