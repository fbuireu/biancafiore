import "./article-card-publish-date.css";
import type { ReactNode } from "react";

export interface ArticleCardPublishDateProps {
	children: ReactNode;
	publishDate: string;
}

export const ArticleCardPublishDate = ({ children, publishDate }: ArticleCardPublishDateProps) => (
	<time className={"article__item__publish-date"} dateTime={publishDate}>
		{children}
	</time>
);
