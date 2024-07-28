import { slugify } from "@shared/ui/utils/slugify";
import type { ReactNode } from "react";
import "./city-name.css";

export interface CityTitleProps {
	children: ReactNode;
	city: string;
}

export const CityName = ({ city, children }: CityTitleProps) => (
	<h3 className="city-card__content__name font-serif" id={slugify(city)}>
		{children}
	</h3>
);
