import type { ArticleDTO } from "@application/dto/article";
import { slugify } from "@shared/ui/utils/slugify";
import type { ReactNode } from "react";

export interface ArticleCardTagItemProps {
	children: ReactNode;
	tag: ArticleDTO["data"]["tags"];
}

export const ArticleCardTagItem = ({ children, tag }: ArticleCardTagItemProps) => (
	<a key={tag} className="article__tag__item" href={`/tags/${slugify(tag)}`}>
		#{children}
	</a>
);
