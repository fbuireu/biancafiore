import type { CollectionEntry } from "astro:content";
import { CityCard } from "@modules/about/components/cityCard";
import { slugify } from "@modules/core/utils/slugify";
import "./cities.css";

interface CitiesProps {
	cities: CollectionEntry<"cities">[];
}

export const Cities = ({ cities }: CitiesProps) => {
	return (
		<ul className="city-card__list">
			{cities.map(({ data }, index) => (
				<CityCard key={data.name} index={index + 1} numCards={cities.length + 1} name={slugify(data.name)}>
					<CityCard.Image src={data.image.url} alt={data.name} />
					<CityCard.Period>{data.period}</CityCard.Period>
					<CityCard.Name>{data.name}</CityCard.Name>
					<CityCard.Description>{data.description}</CityCard.Description>
				</CityCard>
			))}
		</ul>
	);
};
