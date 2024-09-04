import { Image } from "@modules/core/components/image";
import "./article-card-image.css";

export type ArticleCardImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const ArticleCardImage = ({ src, alt }: ArticleCardImageProps) => (
	<Image classNames="article-card__featured-image" src={src} alt={alt} />
);
