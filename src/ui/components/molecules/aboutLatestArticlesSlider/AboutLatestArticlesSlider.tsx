import type { CollectionEntry } from "astro:content";
import { ArticleCard } from "@components/organisms/articleCard/ArticleCard.tsx";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import type { SwiperOptions } from "swiper/types";
import "./about-latest-articles-slider.css";
import { Slider } from "@components/organisms/slider";

interface AboutLatestArticlesSLiderProps {
	articles: CollectionEntry<"articles">[];
	origin: Location;
}

const SLIDER_CONFIG: SwiperOptions = {
	...DEFAULT_SWIPER_CONFIG,
	slidesPerView: 2,
	autoplay: {
		delay: 10000,
		pauseOnMouseEnter: true,
	},
	breakpoints: {
		1024: {
			slidesPerView: 2,
			spaceBetween: 32,
		},
		320: {
			slidesPerView: 1,
		},
	},
	containerModifierClass: "latest-articles-",
};

export const AboutLatestArticlesSlider = ({ articles, origin }: AboutLatestArticlesSLiderProps) => {
	return (
		<div className="about__latest-articles__slider">
			<Slider
				items={articles}
				swiperOptions={SLIDER_CONFIG}
				classNames="--is-about__latest-articles-slider"
				renderItem={({ slug, data: article }) => {
					const href = `/articles/${slug}`;
					const props = { ...article, href, origin };

					return <ArticleCard {...props} />;
				}}
			/>
		</div>
	);
};
