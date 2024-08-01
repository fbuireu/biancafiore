import type { CityDTO } from "@application/dto/city/types.ts";
import { CityCard } from "@components/modules/about/components/cityCard";
import "./cities.css";

interface CitiesProps {
	cities: CityDTO[];
}

export const Cities = ({ cities }: CitiesProps) => {
	return (
		<ul className="city-card__list">
			{cities.map(({ name, period, description, image }, index) => (
				<CityCard key={name} index={index + 1} numCards={cities.length + 1}>
					<CityCard.Image src={image.url} alt={name} />
					<CityCard.Period>{period}</CityCard.Period>
					<CityCard.Title city={name}>{name}</CityCard.Title>
					<CityCard.Description>{description}</CityCard.Description>
				</CityCard>
			))}
		</ul>
	);
};
