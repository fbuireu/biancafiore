import type { BaseTagDTO } from "@application/dto/tag/types";
import { PAGES_ROUTES } from "@const/index";
import type { CSSProperties, ReactNode } from "react";
import "./article-card-tag-item.css";

export interface ArticleCardTagItemProps {
	children: ReactNode;
	tag: BaseTagDTO;
	style: CSSProperties;
}

export const ArticleCardTagItem = ({ children, tag, style }: ArticleCardTagItemProps) => (
	<a
		key={tag.name}
		className="article__tag__item --underline-on-hover"
		href={`${PAGES_ROUTES.TAGS}/${tag.slug}`}
		style={style}
	>
		#{children}
	</a>
);
