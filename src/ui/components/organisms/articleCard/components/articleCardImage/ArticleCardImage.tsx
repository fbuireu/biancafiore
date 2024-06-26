import "./article-card-image.css";

export type ArticleCardImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const ArticleCardImage = ({ src, alt }: ArticleCardImageProps) => (
	<img className="article__item__featured" src={src} alt={alt} decoding="async" loading="lazy" />
);
