import { Image } from "@modules/core/components/image";
import "./city-image.css";

export type CityImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const CityImage = ({ src, alt }: CityImageProps) => (
	<Image classNames="city-card__content__image" src={src} alt={alt} />
);
