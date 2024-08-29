import { CityDescription } from "@modules/about/components/cityCard/atoms/cityDescription";
import type { CityDescriptionProps } from "@modules/about/components/cityCard/atoms/cityDescription";
import { CityImage } from "@modules/about/components/cityCard/atoms/cityImage";
import type { CityImageProps } from "@modules/about/components/cityCard/atoms/cityImage";
import { CityName } from "@modules/about/components/cityCard/atoms/cityName";
import type { CityNameProps } from "@modules/about/components/cityCard/atoms/cityName";
import { CityPeriod } from "@modules/about/components/cityCard/atoms/cityPeriod";
import type { CityPeriodProps } from "@modules/about/components/cityCard/atoms/cityPeriod";
import type { CSSProperties, ReactNode } from "react";
import "./city-card.css";

interface CityCardProps {
	children: ReactNode;
	index: number;
	numCards: number;
	name: string;
}

export const CityCard = ({ children, index, numCards, name }: CityCardProps) => {
	const style: CSSProperties & { [key: string]: string } = {
		"--inline-index": String(index),
		"--inline-num-cards": String(numCards),
	};
	return (
		<li className={"city-card__item"} style={style} id={name}>
			<article className={"city-card__content"}>{children}</article>
		</li>
	);
};

const Image = (props: CityImageProps) => <CityImage {...props} />;
const Period = ({ children }: CityPeriodProps) => <CityPeriod>{children}</CityPeriod>;
const Name = ({ children }: CityNameProps) => <CityName>{children}</CityName>;
const Description = ({ children }: CityDescriptionProps) => <CityDescription>{children}</CityDescription>;

CityCard.Period = Period;
CityCard.Name = Name;
CityCard.Description = Description;
CityCard.Image = Image;
