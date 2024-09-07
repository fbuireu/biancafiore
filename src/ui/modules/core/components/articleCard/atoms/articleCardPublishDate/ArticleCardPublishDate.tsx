import type { ReactNode } from "react";
import "./article-card-publish-date.css";

export interface ArticleCardPublishDateProps {
	children: ReactNode;
	publishDate: string;
}

export const ArticleCardPublishDate = ({ children, publishDate }: ArticleCardPublishDateProps) => (
	<time className={"article-card__publish-date"} dateTime={publishDate}>
		{children}
	</time>
);
