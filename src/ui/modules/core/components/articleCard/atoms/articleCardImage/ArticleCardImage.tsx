import { Picture } from "@modules/core/components/picture";
import type { ImageFormats } from "@shared/application/types";
import "./article-card-image.css";

export interface ArticleCardImageProps extends Pick<HTMLImageElement, "src" | "alt"> {
	formats: ImageFormats;
}

export const ArticleCardImage = (props: ArticleCardImageProps) => (
	<Picture classNames="article-card__featured-image" {...props} />
);
