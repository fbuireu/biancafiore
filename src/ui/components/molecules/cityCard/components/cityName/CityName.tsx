import "./city-name.css";
import type { ReactNode } from "react";

export interface CityTitleProps {
	children: ReactNode;
}

export const CityName = ({ children }: CityTitleProps) => (
	<h3 className="city-card__content__name font-serif">{children}</h3>
);
