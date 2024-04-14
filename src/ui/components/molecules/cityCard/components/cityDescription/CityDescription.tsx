import "./city-description.css";
import type { ReactNode } from "react";

export interface CityDescriptionProps {
	children: ReactNode;
}

export const CityDescription = ({ children }: CityDescriptionProps) => (
	<p className="city-card__content__description">{children}</p>
);
