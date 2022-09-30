import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useLatestArticles } from '../../../utils/hooks/useLatestArticles'
import AboutMeLatestArticleCard
  from '../../atoms/AboutMeLatestArticleCard/AboutMeLatestArticleCard'
import './AboutMeLatestArticles.scss'
import React from 'react'

SwiperCore.use([Navigation])

const AboutMeLatestArticles = ({
  latestArticlesData: {
    title,
    quote,
    author,
  },
}) => {
  const latestArticles = useLatestArticles()

  const SLIDER_PARAMETERS = {
    navigation: true,
    loop: false,
    slidesPerView: 2,
    spaceBetween: 80,
    keyboard: {
      enabled: true,
    },
  }

  return <section className={`about-me__latest-articles__wrapper wrapper`}>
    <Markdown className={`about-me__latest-articles__title`}
              options={{ wrapper: `h2`, forceWrapper: true }}>
      {title}
    </Markdown>
    <div className={`about-me__latest-articles__inner`}>
      <div className={`about-me__quote__wrapper`}>
        <Markdown className={`about-me__quote__text`} options={{ wrapper: `h3`, forceWrapper: true }}>{quote}</Markdown>
        <p className={`about-me__quote__author`}>{author}</p>
      </div>
      <ul className={`about-me__latest-articles__list`}>
        <Swiper {...SLIDER_PARAMETERS} className={`about-me__latest-articles__slider`}>
          {latestArticles.map(({ node: article }) => (
            <SwiperSlide key={article.frontmatter.content.title}>
              <AboutMeLatestArticleCard {...article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </ul>
    </div>
  </section>;
};

AboutMeLatestArticles.propTypes = {
  latestArticlesData: PropTypes.string.isRequired
};

AboutMeLatestArticles.defaultProps = {};

export default AboutMeLatestArticles;
