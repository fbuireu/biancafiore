import { Image } from "@shared/ui/components/image";
import "./article-card-image.css";

export type ArticleCardImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const ArticleCardImage = ({ src, alt }: ArticleCardImageProps) => (
	<Image classNames="article__item__featured" src={src} alt={alt} />
);
