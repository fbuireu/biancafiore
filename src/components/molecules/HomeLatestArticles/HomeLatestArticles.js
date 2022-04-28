import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import SwiperCore, { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import { useLatestArticles } from '../../../utils/hooks/useLatestArticles';
import { useWindowSize } from '../../../utils/hooks/useWindowSize';
import HomeLatestArticleCard from '../../atoms/HomeLatestArticleCard/HomeLatestArticleCard';
import './HomeLatestArticles.scss';

SwiperCore.use([Navigation]);

const HomeLatestArticles = ({ title }) => {
  const latestArticles = useLatestArticles();
  const { width: windowWidth } = useWindowSize();

  const SLIDER_PARAMETERS = {
    loop: windowWidth < 960,
    navigation: windowWidth < 960,
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
        slidesPerView: 4,
        spaceBetween: 32
      },
      960: {
        slidesPerView: 2,
        spaceBetween: 32
      },
      720: {
        slidesPerView: 1
      }
    }
  };

  return <section className={`home__latest-articles__wrapper`}>
    <div className={`wrapper`}>
      <Markdown className={`home__latest-articles__title`}
                options={{ wrapper: `h2`, forceWrapper: true }}>
        {title}
      </Markdown>
      <Swiper {...SLIDER_PARAMETERS}>
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
