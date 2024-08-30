import type { CollectionEntry } from "astro:content";
import { DEFAULT_SWIPER_CONFIG } from "@const/const";
import { ArticleCard } from "@modules/core/components/articleCard/ArticleCard";
import { Slider } from "@modules/core/components/slider";
import type { SwiperOptions } from "swiper/types";
import "./about-latest-articles-slider.css";
import type { CSSProperties } from "react";

interface AboutLatestArticlesSLiderProps {
	articles: CollectionEntry<"articles">[];
	location: URL;
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

export const AboutLatestArticlesSlider = ({ articles, location }: AboutLatestArticlesSLiderProps) => {
	return (
		<div className="about__latest-articles__slider">
			<Slider
				items={articles}
				swiperOptions={SLIDER_CONFIG}
				classNames="--is-about__latest-articles-slider"
				renderItem={(article) => {
					const props = { ...article, location };

					return (
						<ArticleCard {...props}>
							<ArticleCard.PublishDate publishDate={article.data.publishDate}>
								{article.data.publishDate}
							</ArticleCard.PublishDate>
							{article.data.featuredImage && (
								<ArticleCard.Image src={article.data.featuredImage.url} alt={article.data.title} />
							)}
							<ArticleCard.Title>{article.data.title}</ArticleCard.Title>
							<ArticleCard.Excerpt>{article.data.description}</ArticleCard.Excerpt>
							<ArticleCard.Author slug={article.data.author.slug}>{article.data.author.name}</ArticleCard.Author>
							<ArticleCard.ReadingTime>{article.data.readingTime} min.</ArticleCard.ReadingTime>
							<ArticleCard.Tags>
								{article.data.tags?.map((tag, index) => {
									const style: CSSProperties & { [key: string]: string } = {
										"--inline-index": String(index),
									};

									return (
										<ArticleCard.Tag key={tag.name} tag={tag} style={style}>
											{tag.name}
										</ArticleCard.Tag>
									);
								})}
							</ArticleCard.Tags>
						</ArticleCard>
					);
				}}
			/>
		</div>
	);
};
