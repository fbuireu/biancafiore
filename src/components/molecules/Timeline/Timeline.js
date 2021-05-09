import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import 'swiper/components/navigation/navigation.min.css';
import SwiperCore, { Navigation } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import 'swiper/swiper.scss';
import './Timeline.scss';

SwiperCore.use([Navigation]);

const Timeline = ({  years, findSelectedCityNameByIndex, selectedCityIndex }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleOnSlideChange = swiper => findSelectedCityNameByIndex(swiper.activeIndex);

  useEffect(function slideToIndex () {
    swiperInstance?.slideTo(selectedCityIndex);
  }, [selectedCityIndex, swiperInstance]);

  const SLIDER_PARAMETERS = {
    navigation: true,
    loop: false,
    initialSlide: selectedCityIndex
  };

  return <section className={`timeline__wrapper`}>
    <Swiper {...SLIDER_PARAMETERS}
            onSwiper={swiper => setSwiperInstance(swiper)}
            onSlideChange={swiper => handleOnSlideChange(swiper)}
            className={`timeline__slider`}
            activeSlideKey={selectedCityIndex}
    >
      {years.map(({ year, description, name }) => (
        <SwiperSlide key={name}>
          {({ isActive }) => <div key={year} /*isActive={isActive}*/>{year} <br /> {description}</div>}
        </SwiperSlide>
      ))}
    </Swiper>
  </section>;
};

Timeline.propTypes = {
  years: PropTypes.arrayOf(PropTypes.object).isRequired,
  findSelectedCityNameByIndex: PropTypes.func.isRequired,
  selectedCityIndex: PropTypes.number
};

Timeline.defaultProps = {};

export default Timeline;
