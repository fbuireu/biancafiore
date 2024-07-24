import type { BaseTagDTO } from "@application/dto/tag/types.ts";
import type { ReactNode } from "react";

export interface ArticleCardTagItemProps {
	children: ReactNode;
	tag: BaseTagDTO;
}

export const ArticleCardTagItem = ({ children, tag }: ArticleCardTagItemProps) => (
	<a key={tag.name} className="article__tag__item" href={`/tags/${tag.slug}`}>
		#{children}
	</a>
);
