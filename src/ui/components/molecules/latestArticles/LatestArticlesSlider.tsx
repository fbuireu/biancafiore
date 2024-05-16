import type { CollectionEntry } from "astro:content";
import { createExcerpt } from "@shared/utils/createExcerpt";
import { slugify } from "@shared/utils/slugify";
import MarkdownIt from "markdown-it";
import { DEFAULT_DATE_FORMAT } from "src/consts.ts";
import { A11y, Keyboard, Navigation, Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import "./latest-articles-slider.css";
import { LatestArticlesSliderNavigation } from './components/latestArticlesSliderNavigation';

interface LatestArticlesSLiderProps {
	articles: CollectionEntry<"articles">[];
}

enum ArticleType {
	DEFAULT = "default",
	NO_IMAGE = "no_image",
}

const SLIDER_CONFIG: SwiperOptions = {
	modules: [Navigation, Keyboard, Virtual, A11y],
	loop: true,
	slidesPerView: 4,
	autoplay: {
		delay: 3000,
		pauseOnMouseEnter: true,
	},
	pagination: {
		clickable: true,
	},
	keyboard: {
		enabled: true,
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
const parser: MarkdownIt = MarkdownIt("default", {});

export const LatestArticlesSlider = ({ articles }: LatestArticlesSLiderProps) => {
	return (
		<div className="latest-articles__slider common-wrapper">
			<Swiper onResize={(e)=> console.log(e)} {...SLIDER_CONFIG}>
				<ul className="latest__articles__list flex row-wrap justify-space-between">
					{articles.map(({ slug, data: article, ...content }) => {
						const { excerpt } = createExcerpt({
							parser,
							content: content.body,
						});
						const variant: ArticleType = article.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE;
						const publishedDate = article.publishDate.toLocaleDateString("en", DEFAULT_DATE_FORMAT);
						const href = `/articles/${slug}`;

						return (
							<li key={slug} className="latest__article__item__wrapper article__item clickable">
								<SwiperSlide key={slug}>
									<a className="latest__article__link-card" href={href} aria-label={article.title} />
									<article
										className={`latest__article__item ${
											variant === ArticleType.DEFAULT ? '--default-variant' : '--no-image-variant'
										}`}
									>
										{article.featuredImage && (
											<img
												className="latest__article__item__featured-image"
												src={article.featuredImage}
												alt={article.title}
												loading="lazy"
												decoding="async"
											/>
										)}
										<time className="latest__article__item__publish-date" dateTime={publishedDate}>
											{publishedDate}
										</time>
										<h3 className="latest__article__title font-serif inner-section-title">{article.title}</h3>
										<p className="latest__article__author">
											by <a href={`/tags/${slugify(article.author)}`}>{article.author}</a>
										</p>
										<p className="latest__article__excerpt">{excerpt}</p>
										<ul className="latest__article__tags__list flex">
											{article.tags?.map((tag: string) => (
												<a className="latest__article__tag__item" href={`/tags/${slugify(tag)}`} key={tag}>
													#{tag}
												</a>
											))}
										</ul>
									</article>
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
