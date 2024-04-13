import React, { type CSSProperties, type ReactNode } from "react";
import "./city-card.css";
import { CityPeriod, type CityPeriodProps } from "src/ui/components/molecules/cityCard/components/cityPeriod";
import { CityName, type CityTitleProps } from "src/ui/components/molecules/cityCard/components/cityName";
import { CityImage, type CityImageProps } from "@components/molecules/cityCard/components/cityImage";
import { CityDescription, type CityDescriptionProps } from "@components/molecules/cityCard/components/cityDescription";

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
		<li className={`city-card__item`} style={style}>
			<article className={`city-card__content`}>{children}</article>
		</li>
	);
};

const Image = (props: CityImageProps) => <CityImage {...props} />;
const Period = ({ children }: CityPeriodProps) => <CityPeriod>{children}</CityPeriod>;
const Title = ({ children }: CityTitleProps) => <CityName>{children}</CityName>;
const Description = ({ children }: CityDescriptionProps) => <CityDescription>{children}</CityDescription>;

CityCard.Period = Period;
CityCard.Title = Title;
CityCard.Description = Description;
CityCard.Image = Image;
