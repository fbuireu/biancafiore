import { slugify } from "src/ui/shared/ui/utils/slugify";
import { A11y, Keyboard, Navigation, Virtual, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import "./latest-articles-slider.css";
import { LatestArticlesSliderNavigation } from "./components/latestArticlesSliderNavigation";
import clsx from "clsx";
import { type ArticleDTO, ArticleType } from "@application/dto/articleDTO.ts";

interface LatestArticlesSLiderProps {
	articles: ArticleDTO[];
}

const SLIDER_CONFIG: SwiperOptions = {
	modules: [Navigation, Keyboard, Virtual, Autoplay, A11y],
	loop: true,
	slidesPerView: 4,
	autoplay: {
		delay: 10000,
		pauseOnMouseEnter: true,
	},
	pagination: {
		clickable: true,
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

export const LatestArticlesSlider = ({ articles }: LatestArticlesSLiderProps) => {
	return (
		<div className="latest-articles__slider common-wrapper">
			<Swiper {...SLIDER_CONFIG}>
				<ul className="latest__articles__list flex row-wrap justify-space-between">
					{articles.map(({ slug, data: { title, description, featuredImage, publishDate, variant, author, tags } }) => {
						const href = `/articles/${slug}`;

						return (
							<li key={slug} className="latest__article__item__wrapper article__item clickable">
								<SwiperSlide key={slug}>
									<a className="latest__article__link-card" href={href} aria-label={title} />
									<article
										className={clsx("latest__article__item", {
											"--default-variant": variant === ArticleType.DEFAULT,
											"--no-image-variant": variant === ArticleType.NO_IMAGE,
										})}
									>
										{featuredImage && (
											<img
												className="latest__article__item__featured-image"
												src={featuredImage}
												alt={title}
												loading="lazy"
												decoding="async"
											/>
										)}
										<time className="latest__article__item__publish-date" dateTime={publishDate}>
											{publishDate}
										</time>
										<h3 className="latest__article__title font-serif inner-section-title">{title}</h3>
										<p className="latest__article__author">
											by <a href={`/tags/${author.data?.id}`}>{author.data.name}</a>
										</p>
										<p className="latest__article__excerpt">{description}</p>
										<ul className="latest__article__tags__list flex">
											{tags?.map((tag: string) => (
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
