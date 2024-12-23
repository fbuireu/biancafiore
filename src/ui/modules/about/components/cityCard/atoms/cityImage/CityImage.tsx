import { Picture } from "@modules/core/components/picture";
import type { ImageFormats } from "@shared/application/types";
import type { JSX } from "react";
import "./city-image.css";

export interface CityImageProps extends Pick<HTMLImageElement, "src" | "alt"> {
	formats: ImageFormats;
}

export const CityImage = (props: CityImageProps): JSX.Element => (
	<Picture classNames="city-card__content__image" {...props} />
);
