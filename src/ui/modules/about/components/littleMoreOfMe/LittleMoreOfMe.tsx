import type { CollectionEntry } from 'astro:content';
import { Cities } from '@modules/about/components/cities';
import WorldGlobe from '@modules/about/components/worldGlobe/WorldGlobe';
import './little-more-of-me.css';

interface LittleMoreOfMeProps {
  cities: CollectionEntry<'cities'>[];
}

export const LittleMoreOfMe = ({ cities }: LittleMoreOfMeProps) => {
  return (
      <section className="little-more-of-me__wrapper common-wrapper">
        <h2 className="little-more-of-me__title section-title">A little more of me</h2>
        <div className="little-more-of-me__inner flex row-nowrap justify-space-between">
          <WorldGlobe cities={cities} />
          <Cities cities={cities} />
        </div>
      </section>
  );
};
