import type { CollectionEntry } from "astro:content";
import { AboutLatestArticlesSliderNavigation } from "@components/molecules/aboutLatestArticlesSlider/components/aboutLatestArticlesSliderNavigation";
import { createExcerpt } from "@shared/utils/createExcerpt";
import { slugify } from "@shared/utils/slugify";
import MarkdownIt from "markdown-it";
import { DEFAULT_DATE_FORMAT } from "src/consts.ts";
import { A11y, Keyboard, Navigation, Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import "./about-latest-articles-slider.css";

interface AboutLatestArticlesSLiderProps {
	articles: CollectionEntry<"articles">[];
}

enum ArticleType {
	DEFAULT = "default",
	NO_IMAGE = "no_image",
}

const SLIDER_CONFIG: SwiperOptions = {
	modules: [Navigation, Keyboard, Virtual, A11y],
	loop: true,
	slidesPerView: 2,
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

// todo: isolate and use composition
export const AboutLatestArticlesSlider = ({ articles }: AboutLatestArticlesSLiderProps) => {
	return (
		<div className="about__latest-articles__slider">
			<Swiper {...SLIDER_CONFIG}>
				<ul>
					{articles.map(({ slug, data: article, ...content }) => {
						const { excerpt } = createExcerpt({
							parser,
							content: content.body,
						});
						const variant: ArticleType = article.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE;
						const publishedDate = article.publishDate.toLocaleDateString("en", DEFAULT_DATE_FORMAT);
						const href = `/articles/${slug}`;

						return (
							<li key={slug} className="about__latest-article__item__wrapper clickable">
								<SwiperSlide key={slug}>
									<a className="about__latest-article__link-card" href={href} aria-label={article.title} />
									<article
										className={`about__latest-article__item ${
											variant === ArticleType.DEFAULT ? "--default-variant" : "--no-image-variant"
										}`}
									>
										{article.featuredImage && (
											<img
												className="about__latest-article__item__featured-image"
												src={article.featuredImage}
												alt={article.title}
												loading="lazy"
												decoding="async"
											/>
										)}
										<time className="about__latest-article__item__publish-date" dateTime={publishedDate}>
											{publishedDate}
										</time>
										<h3 className="about__latest-article__title font-serif">{article.title}</h3>
										<p className="about__latest-article__author">
											by <a href={`/tags/${slugify(article.author)}`}>{article.author}</a>
										</p>
										<p className="about__latest-article__excerpt">{excerpt}</p>
										<ul className="about__latest-article__item__tags__list">
											{article.tags?.map((tag: string) => (
												<a className="about__latest-article__item__tag" href={`/tags/${slugify(tag)}`} key={tag}>
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
				<AboutLatestArticlesSliderNavigation />
			</Swiper>
		</div>
	);
};
