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
	<li key={tag.name} className="article-card__tag__item" style={style}>
		<a
			href={`${PAGES_ROUTES.TAGS}/${tag.slug}`}
			className="--underline-on-hover --is-clickable"
		>
		#{children}
	</a>
	</li>
);
