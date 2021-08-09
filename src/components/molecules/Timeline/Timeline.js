import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import 'swiper/components/navigation/navigation.min.css';
import SwiperCore, { Navigation } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import 'swiper/swiper.scss';
import TimelineCity from '../../atoms/TimelineCity/TimelineCity';
import './Timeline.scss';

SwiperCore.use([Navigation]);

const Timeline = ({ title, years, findSelectedCityNameByIndex, selectedCityIndex }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const sliderReference = useRef(null);

  useEffect(function slideToIndex() {
    swiperInstance?.slideTo(selectedCityIndex);
  }, [selectedCityIndex, swiperInstance]);

  function handleOnSlideChange(swiper) {
    findSelectedCityNameByIndex({ selectedIndex: swiper.activeIndex });
  }

  const SLIDER_PARAMETERS = {
    navigation: true,
    loop: false,
    centeredSlides: true,
    slidesPerView: 3,
    initialSlide: selectedCityIndex,
    spaceBetween: 80,
    keyboard: {
      enabled: true
    }
  };

  return <section className={`timeline__wrapper`}>
    <h2 className={`timeline__title`}>{title}</h2>
    <Swiper {...SLIDER_PARAMETERS}
            onSwiper={swiper => setSwiperInstance(swiper)}
            onSlideChange={swiper => handleOnSlideChange(swiper)}
            ref={sliderReference}
            className={`timeline__slider`}
    >
      {years.map(year => (
        <SwiperSlide key={year.name}>
          {({ isActive }) => <TimelineCity {...year} isActive={isActive} />}
        </SwiperSlide>
      ))}
    </Swiper>
  </section>;
};

Timeline.propTypes = {
  title: PropTypes.string.isRequired,
  years: PropTypes.arrayOf(PropTypes.object).isRequired,
  findSelectedCityNameByIndex: PropTypes.func.isRequired,
  selectedCityIndex: PropTypes.number
};

Timeline.defaultProps = {};

export default Timeline;
