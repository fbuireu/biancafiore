import type { CityDTO } from "@application/dto/city/types.ts";
import WorldGlobe from "@components/atoms/worldGlobe/WorldGlobe.tsx";
import { Cities } from "@components/organisms/cities";
import "./little-more-of-me.css";

interface LittleMoreOfMeProps {
	cities: CityDTO[];
}

export const LittleMoreOfMe = ({ cities }: LittleMoreOfMeProps) => {
	return (
		<section className="little-more-of-me__wrapper common-wrapper">
			<h3 className="little-more-of-me__title section-title">A little more of me</h3>
			<div className="little-more-of-me__inner flex row-nowrap justify-space-between">
				<WorldGlobe cities={cities} />
				<Cities cities={cities} />
			</div>
		</section>
	);
};
