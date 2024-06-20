import type { SwiperOptions } from "swiper/types";
import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import { ArticleCard } from "@components/organisms/articleCard/ArticleCard.tsx";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import "./latest-articles-slider.css";
import { Slider } from "@components/organisms/slider";

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
			<Slider
				items={articles}
				swiperOptions={SLIDER_CONFIG}
				classNames="--is-latest-articles-slider"
				renderItem={({ slug, data: article }) => {
					const href = `/articles/${slug}`;
					const props = { ...article, href, origin };

					return <ArticleCard {...props} />;
				}}
			/>
		</div>
	);
};
