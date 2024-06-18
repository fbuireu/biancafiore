import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import { LatestArticlesSliderNavigation } from "./components/latestArticlesSliderNavigation";
import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import { ArticleCard } from "@components/organisms/articleCard/ArticleCard.tsx";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import "./latest-articles-slider.css";

interface LatestArticlesSLiderProps {
	articles: ArticleDTO[];
	origin: string;
}

const SLIDER_CONFIG: SwiperOptions = {
	...DEFAULT_SWIPER_CONFIG,
	slidesPerView: 4,
	autoplay: {
		delay: 10000,
		pauseOnMouseEnter: true,
	},
	breakpoints: {
		1024: {
			slidesPerView: 4,
			spaceBetween: 32,
		},
		720: {
			slidesPerView: 2,
			spaceBetween: 32,
		},
		320: {
			slidesPerView: 1,
		},
	},
	containerModifierClass: "latest-articles-",
};

export const LatestArticlesSlider = ({ articles, origin }: LatestArticlesSLiderProps) => {
	return (
		<div className="latest-articles__slider common-wrapper">
			<Swiper {...SLIDER_CONFIG}>
				<ul className="latest__articles__list flex row-wrap justify-space-between">
					{articles.map(({ slug, data: article }) => {
						const href = `/articles/${slug}`;
						const props = { ...article, href };

						return (
							<li key={slug} className="latest__article__item__wrapper article__item clickable">
								<SwiperSlide key={slug}>
									<ArticleCard origin={origin} {...props} />
								</SwiperSlide>
							</li>
						);
					})}
				</ul>
				<LatestArticlesSliderNavigation />
			</Swiper>
		</div>
	);
};
