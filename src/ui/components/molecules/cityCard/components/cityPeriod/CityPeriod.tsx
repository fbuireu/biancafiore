import "./city-period.css";
import type { ReactNode } from "react";

export interface CityPeriodProps {
	children: ReactNode;
}

export const CityPeriod = ({ children }: CityPeriodProps) => (
	<h4 className="city-card__content__period font-serif">{children}</h4>
);
