import type { JSX, ReactNode } from "react";
import "./city-name.css";

export interface CityNameProps {
	children: ReactNode;
}

export const CityName = ({ children }: CityNameProps): JSX.Element => (
	<h3 className="city-card__content__name font-serif">{children}</h3>
);
