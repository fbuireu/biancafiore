import type { CollectionEntry } from "astro:content";
import { DEFAULT_SWIPER_CONFIG } from "@const/index";
import { ArticleCard } from "@modules/core/components/articleCard/ArticleCard";
import { Slider } from "@modules/core/components/slider";
import type { CSSProperties, JSX } from "react";
import type { SwiperOptions } from "swiper/types";

interface RelatedArticlesSliderProps {
	articles: CollectionEntry<"articles">[];
	origin: URL;
}

const SLIDER_CONFIG: SwiperOptions = {
	...DEFAULT_SWIPER_CONFIG,
	slidesPerView: 3,
	autoplay: {
		delay: 10000,
		pauseOnMouseEnter: true,
	},
	breakpoints: {
		1024: {
			slidesPerView: 3,
			spaceBetween: 32,
			loop: false,
		},
		720: {
			slidesPerView: 2,
			spaceBetween: 32,
			loop: true,
		},
		320: {
			slidesPerView: 1,
		},
	},
	containerModifierClass: "related-articles-",
};

export const RelatedArticlesSlider = ({ articles, origin }: RelatedArticlesSliderProps): JSX.Element => {
	return (
		<div className="related-articles__slider common-wrapper">
			<Slider
				items={articles}
				swiperOptions={SLIDER_CONFIG}
				origin={origin}
				renderItem={(article) => {
					const props = { ...article, origin };

					return (
						<ArticleCard {...props}>
							<ArticleCard.PublishDate publishDate={article.data.publishDate}>
								{article.data.publishDate}
							</ArticleCard.PublishDate>
							{article.data.featuredImage && (
								<ArticleCard.Image
									src={article.data.featuredImage.url}
									alt={article.data.title}
									formats={article.data.featuredImage.formats}
								/>
							)}
							<ArticleCard.Title>{article.data.title}</ArticleCard.Title>
							<ArticleCard.Excerpt>{article.data.description}</ArticleCard.Excerpt>
							<ArticleCard.Author slug={article.data.author.slug}>{article.data.author.name}</ArticleCard.Author>
							<ArticleCard.ReadingTime>{article.data.readingTime} minutes read</ArticleCard.ReadingTime>
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
