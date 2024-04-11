import React, { type ReactNode } from "react";
import "./city-name.css";

export interface CityTitleProps {
	children: ReactNode;
}

export const CityName = ({ children }: CityTitleProps) => (
	<h3 className="city-card__content__name font-serif">{children}</h3>
);
