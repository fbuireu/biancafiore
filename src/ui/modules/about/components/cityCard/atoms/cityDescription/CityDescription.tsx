import type { JSX, ReactNode } from "react";
import "./city-description.css";

export interface CityDescriptionProps {
	children: ReactNode;
}

export const CityDescription = ({ children }: CityDescriptionProps): JSX.Element => (
	<p className="city-card__content__description">{children}</p>
);
