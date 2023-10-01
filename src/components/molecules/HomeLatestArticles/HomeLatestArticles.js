import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React from 'react';
import {Navigation} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import {useLatestArticles} from '../../../utils/hooks/useLatestArticles';
import HomeLatestArticleCard from '../../atoms/HomeLatestArticleCard/HomeLatestArticleCard';
import './HomeLatestArticles.scss';

const SLIDER_DEFAULT_PARAMETERS = {
  navigation: true,
  loop: false,
  modules: [Navigation],
  centeredSlides: true,
  slidesPerView: 1,
  spaceBetween: 80,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
  },
  keyboard: {
    enabled: true,
  },
  breakpoints: {
    1024: {
      slidesPerView: 4,
    },
    960: {
      slidesPerView: 2,
    },
    720: {
      slidesPerView: 1,
    },
  },
};

const HomeLatestArticles = ({ title }) => {
  const latestArticles = useLatestArticles();

  return (
    <section className={`home__latest-articles__wrapper`}>
      <div className={`wrapper`}>
        <Markdown
              className={`home__latest-articles__title`}
              options={{wrapper: `h2`, forceWrapper: true}}
        >
          {title}
        </Markdown>
        <Swiper
              className={`home__latest-articles__slider wrapper`}
              {...SLIDER_DEFAULT_PARAMETERS}
        >
          <ul className={`home__latest-articles__list`}>
            {latestArticles.map(({node: article}) => (
              <SwiperSlide key={article.frontmatter.content.title}>
                <HomeLatestArticleCard {...article} />
              </SwiperSlide>
            ))}
          </ul>
        </Swiper>
      </div>
    </section>
  )
};

HomeLatestArticles.propTypes = {
  title: PropTypes.string.isRequired,
};

HomeLatestArticles.defaultProps = {};

export default HomeLatestArticles;
