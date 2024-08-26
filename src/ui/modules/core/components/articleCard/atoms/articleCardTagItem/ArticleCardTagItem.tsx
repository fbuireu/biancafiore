import type { BaseTagDTO } from "@application/dto/tag/types.ts";
import { PAGES_ROUTES } from "@const/const.ts";
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
		className="article__tag__item underline-on-action"
		href={`${PAGES_ROUTES.tags}/${tag.slug}`}
		style={style}
	>
		#{children}
	</a>
);
