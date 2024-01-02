import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Navigation, Virtual } from 'swiper/modules';
import { type SwiperOptions } from 'swiper/types';
import { AboutLatestArticlesSliderNavigation } from '@components/molecules/aboutLatestArticlesSlider/components/aboutLatestArticlesSliderNavigation';
import { getCollection } from 'astro:content';
import { createExcerpt } from '@shared/utils/createExcerpt';
import { DEFAULT_DATE_OPTIONS } from 'src/consts.ts';
import MarkdownIt from 'markdown-it';
import { slugify } from '@shared/utils/slugify';
import './about-latest-articles-slider.css';

const enum ArticleType {
  DEFAULT = 'default',
  NO_IMAGE = 'no_image',
}

const SLIDER_CONFIG: SwiperOptions = {
  modules: [Navigation, Keyboard, Virtual, A11y],
  loop: true,
  // centeredSlides: true,
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
  containerModifierClass: 'latest-articles-',
};
const parser: MarkdownIt = MarkdownIt('default', {});
const articles = await getCollection('articles');
articles.sort((a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf()).splice(4);

// todo: isolate and use composition
export const AboutLatestArticlesSlider = () => {
  return (
    <div className="about__latest-articles__slider">
      <Swiper {...SLIDER_CONFIG}>
        <ul>
          {articles.map(({ slug, data, ...article }) => {
            const { excerpt } = createExcerpt({ parser, content: article.body });
            const variant: ArticleType = data.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE;
            const publishedDate = data.publishDate.toLocaleDateString('en', DEFAULT_DATE_OPTIONS);
            const href = `/articles/${slug}`;

            return (
              <li key={slug} className="about__latest-article__item__wrapper clickable">
                <SwiperSlide key={slug}>
                  <a className="about__latest-article__link-card" href={href} />
                  <article
                    className={`about__latest-article__item ${
                      variant === ArticleType.DEFAULT ? '--default-variant' : '--no-image-variant'
                    }`}
                  >
                    {data.featuredImage && (
                      <img
                        className="about__latest-article__item__featured-image"
                        src={data.featuredImage}
                        alt={data.title}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <time className="about__latest-article__item__publish-date" dateTime={publishedDate}>
                      {publishedDate}
                    </time>
                    <h3 className="about__latest-article__title font-serif">{data.title}</h3>
                    <p className="about__latest-article__author">
                      by <a href={`/tags/${slugify(data.author)}`}>{data.author}</a>
                    </p>
                    <p className="about__latest-article__excerpt">{excerpt}</p>
                    <ul className="about__latest-article__item__tags__list">
                      {data.tags?.map((tag) => (
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
