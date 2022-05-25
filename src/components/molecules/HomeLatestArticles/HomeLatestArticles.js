import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import { v4 as uuidv4 } from 'uuid';
import { useLatestArticles } from '../../../utils/hooks/useLatestArticles';
import { useWindowSize } from '../../../utils/hooks/useWindowSize';
import HomeLatestArticleCard from '../../atoms/HomeLatestArticleCard/HomeLatestArticleCard';
import './HomeLatestArticles.scss';

const SLIDER_DEFAULT_PARAMETERS = {
  loop: true,
  navigation: true,
  spaceBetween: 32,
  modules: [
    Navigation
  ],
  autoplay: {
    delay: 5000,
    disableOnInteraction: true
  },
  centeredSlides: false,
  keyboard: {
    enabled: true
  },
  breakpoints: {
    1024: {
      slidesPerView: 4
    },
    960: {
      slidesPerView: 2
    },
    720: {
      slidesPerView: 1
    }
  }
};

const HomeLatestArticles = ({ title }) => {
  const [sliderParameters, setSliderParameters] = useState(SLIDER_DEFAULT_PARAMETERS);
  let [sliderKey, setSliderKey] = useState(uuidv4());
  const latestArticles = useLatestArticles();
  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    if (windowWidth >= 1024) {
      setSliderParameters({
        ...sliderParameters,
        loop: false,
        navigation: false
      });
      setSliderKey(uuidv4());
    } else {
      setSliderParameters(SLIDER_DEFAULT_PARAMETERS);
      setSliderKey(uuidv4());
    }
  }, [windowWidth]);

  return <section className={`home__latest-articles__wrapper`}>
    <div className={`wrapper`}>
      <Markdown className={`home__latest-articles__title`}
                options={{ wrapper: `h2`, forceWrapper: true }}>
        {title}
      </Markdown>
      <Swiper
        key={sliderKey}
        className={`home__latest-articles__slider wrapper`}
        {...sliderParameters}
      >
        <ul className={`home__latest-articles__list`}>
          {latestArticles.map(({ node: article }) => (
            <SwiperSlide key={article.frontmatter.content.title}>
              <HomeLatestArticleCard {...article} />
            </SwiperSlide>
          ))}
        </ul>
      </Swiper>
    </div>
  </section>;
};

HomeLatestArticles.propTypes = {
  title: PropTypes.string.isRequired
};

HomeLatestArticles.defaultProps = {};

export default HomeLatestArticles;
