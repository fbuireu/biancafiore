import type { BaseTagDTO } from "@application/dto/tag/types.ts";
import type { CSSProperties, ReactNode } from "react";
import "./article-card-tag-item.css";

export interface ArticleCardTagItemProps {
	children: ReactNode;
	tag: BaseTagDTO;
	style: CSSProperties;
}

export const ArticleCardTagItem = ({ children, tag, style }: ArticleCardTagItemProps) => (
	<a key={tag.name} className="article__tag__item" href={`/tags/${tag.slug}`} style={style}>
		#{children}
	</a>
);
