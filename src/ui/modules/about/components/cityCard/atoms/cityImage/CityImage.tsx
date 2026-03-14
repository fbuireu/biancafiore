import { Picture } from "@modules/core/components/picture";
import "./city-image.css";

export interface CityImageProps extends Pick<HTMLImageElement, "src" | "alt"> {}

export const CityImage = (props: CityImageProps) => <Picture classNames="city-card__content__image" {...props} />;
