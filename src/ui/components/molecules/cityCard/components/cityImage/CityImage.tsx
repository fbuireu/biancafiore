import React from "react";
import "./city-image.css";

export type CityImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const CityImage = ({ src, alt }: CityImageProps) => (
	<img className="city-card__content__image" src={src} alt={alt} decoding="async" loading="lazy" />
);
