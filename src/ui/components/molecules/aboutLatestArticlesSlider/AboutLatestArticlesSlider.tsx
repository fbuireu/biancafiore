import type { CollectionEntry } from "astro:content";
import { AboutLatestArticlesSliderNavigation } from "@components/molecules/aboutLatestArticlesSlider/components/aboutLatestArticlesSliderNavigation";
import { slugify } from "src/ui/shared/ui/utils/slugify";
import { A11y, Keyboard, Navigation, Autoplay, Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import "./about-latest-articles-slider.css";
import clsx from "clsx";

interface AboutLatestArticlesSLiderProps {
	articles: CollectionEntry<"articles">[];
}

enum ArticleType {
	DEFAULT = "default",
	NO_IMAGE = "no_image",
}

const SLIDER_CONFIG: SwiperOptions = {
	modules: [Navigation, Keyboard, Virtual, Autoplay, A11y],
	loop: true,
	slidesPerView: 2,
	autoplay: {
		delay: 10000,
		pauseOnMouseEnter: true,
	},
	pagination: {
		clickable: true,
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

export const AboutLatestArticlesSlider = ({ articles }: AboutLatestArticlesSLiderProps) => {
	return (
		<div className="about__latest-articles__slider">
			<Swiper {...SLIDER_CONFIG}>
				<ul>
					{articles.map(({ slug, data: { title, description, variant, featuredImage, publishDate, author, tags } }) => {
						const href = `/articles/${slug}`;

						return (
							<li key={slug} className="about__latest-article__item__wrapper clickable">
								<SwiperSlide key={slug}>
									<a className="about__latest-article__link-card" href={href} aria-label={title} />
									<article
										className={clsx("about__latest-article__item", {
											"--default-variant": variant === ArticleType.DEFAULT,
											"--no-image-variant": variant === ArticleType.NO_IMAGE,
										})}
									>
										{featuredImage && (
											<img
												className="about__latest-article__item__featured-image"
												src={featuredImage}
												alt={title}
												loading="lazy"
												decoding="async"
											/>
										)}
										<time className="about__latest-article__item__publish-date" dateTime={publishDate}>
											{publishDate}
										</time>
										<h3 className="about__latest-article__title font-serif">{title}</h3>
										<p className="about__latest-article__author">
											by <a href={`/tags/${author.data.id}`}>{author.data.name}</a>
										</p>
										<p className="about__latest-article__excerpt">{description}</p>
										<ul className="about__latest-article__item__tags__list flex">
											{tags?.map((tag: string) => (
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
