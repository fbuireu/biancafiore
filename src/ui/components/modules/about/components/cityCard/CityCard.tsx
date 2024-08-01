import { CityDescription } from "@components/modules/about/components/cityCard/atoms/cityDescription";
import type { CityDescriptionProps } from "@components/modules/about/components/cityCard/atoms/cityDescription";
import { CityImage } from "@components/modules/about/components/cityCard/atoms/cityImage";
import type { CityImageProps } from "@components/modules/about/components/cityCard/atoms/cityImage";
import { CityName } from "@components/modules/about/components/cityCard/atoms/cityName";
import type { CityTitleProps } from "@components/modules/about/components/cityCard/atoms/cityName";
import { CityPeriod } from "@components/modules/about/components/cityCard/atoms/cityPeriod";
import type { CityPeriodProps } from "@components/modules/about/components/cityCard/atoms/cityPeriod";
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
