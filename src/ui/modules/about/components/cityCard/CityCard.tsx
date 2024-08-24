import { CityDescription } from "@modules/about/components/cityCard/atoms/cityDescription";
import type { CityDescriptionProps } from "@modules/about/components/cityCard/atoms/cityDescription";
import { CityImage } from "@modules/about/components/cityCard/atoms/cityImage";
import type { CityImageProps } from "@modules/about/components/cityCard/atoms/cityImage";
import { CityName } from "@modules/about/components/cityCard/atoms/cityName";
import type { CityTitleProps } from "@modules/about/components/cityCard/atoms/cityName";
import { CityPeriod } from "@modules/about/components/cityCard/atoms/cityPeriod";
import type { CityPeriodProps } from "@modules/about/components/cityCard/atoms/cityPeriod";
import type { CSSProperties, ReactNode } from "react";
import "./city-card.css";

interface CityCardProps {
	children: ReactNode;
	index: number;
	numCards: number;
}

export const CityCard = ({ children, index, numCards }: CityCardProps) => {
	const style: CSSProperties & { [key: string]: string } = {
		"--inline-index": String(index),
		"--inline-num-cards": String(numCards),
	};
	return (
		<li className={"city-card__item"} style={style}>
			<article className={"city-card__content"}>{children}</article>
		</li>
	);
};

const Image = (props: CityImageProps) => <CityImage {...props} />;
const Period = ({ children }: CityPeriodProps) => <CityPeriod>{children}</CityPeriod>;
const Title = ({ children, city }: CityTitleProps) => <CityName city={city}>{children}</CityName>;
const Description = ({ children }: CityDescriptionProps) => <CityDescription>{children}</CityDescription>;

CityCard.Period = Period;
CityCard.Title = Title;
CityCard.Description = Description;
CityCard.Image = Image;
