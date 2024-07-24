import { ArticleCard } from "@components/organisms/articleCard/ArticleCard.tsx";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import type { SwiperOptions } from "swiper/types";
import "./latest-articles-slider.css";
import type { ArticleDTO } from "@application/dto/article/types.ts";
import { Slider } from "@components/organisms/slider";

interface LatestArticlesSLiderProps {
	articles: ArticleDTO[];
	origin: URL;
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
				renderItem={(article) => {
					const href = `/articles/${article.slug}`;
					const props = { ...article, href, origin };

					return (
						<ArticleCard {...props}>
							<ArticleCard.PublishDate publishDate={article.publishDate}>{article.publishDate}</ArticleCard.PublishDate>
							{article.featuredImage && <ArticleCard.Image src={article.featuredImage} alt={article.title} />}
							<ArticleCard.Title>{article.title}</ArticleCard.Title>
							<ArticleCard.Excerpt>{article.description}</ArticleCard.Excerpt>
							<ArticleCard.Author slug={article.author.slug}>{article.author.name}</ArticleCard.Author>
							<ArticleCard.Tags>
								{article.tags?.map((tag) => (
									<ArticleCard.Tag tag={tag} key={tag.name}>
										{tag.name}
									</ArticleCard.Tag>
								))}
							</ArticleCard.Tags>
						</ArticleCard>
					);
				}}
			/>
		</div>
	);
};
