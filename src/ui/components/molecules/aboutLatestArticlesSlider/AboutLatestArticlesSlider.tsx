import type { CollectionEntry } from "astro:content";
import { AboutLatestArticlesSliderNavigation } from "./components/aboutLatestArticlesSliderNavigation";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import { ArticleCard } from "@components/organisms/articleCard/ArticleCard.tsx";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import "./about-latest-articles-slider.css";

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
			<Swiper {...SLIDER_CONFIG}>
				<ul>
					{articles.map(({ slug, data: article }) => {
						const href = `/articles/${slug}`;
						const props = { ...article, href };

						return (
							<li key={slug} className="about__latest-article__item__wrapper clickable">
								<SwiperSlide key={slug}>
									<ArticleCard {...props} origin={origin} />
								</SwiperSlide>
							</li>
						);
					})}
				</ul>
				<AboutLatestArticlesSliderNavigation />
			</Swiper>
		</div>
	);
};
