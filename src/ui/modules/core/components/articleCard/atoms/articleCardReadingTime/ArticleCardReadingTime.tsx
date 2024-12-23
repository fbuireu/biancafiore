import type { JSX, ReactNode } from "react";
import "./article-card-reading-time.css";

export interface ArticleCardReadingTimeProps {
	children: ReactNode;
}

export const ArticleCardReadingTime = ({ children }: ArticleCardReadingTimeProps): JSX.Element => (
	<p className={"article-card__reading-time"}>{children}</p>
);
