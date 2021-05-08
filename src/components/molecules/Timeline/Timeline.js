import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import './Timeline.scss';

const Timeline = ({ title, years, findSelectedCityNameByIndex, selectedCityIndex }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleOnSlideChange = swiper => findSelectedCityNameByIndex(swiper.activeIndex);

  useEffect(function slideToIndex () {
    swiperInstance?.slideTo(selectedCityIndex);
  }, [selectedCityIndex, swiperInstance]);

  const SLIDER_PARAMETERS = {
    loop: false,
    initialSlide: selectedCityIndex
  };

  return <section>
    <h2>{title}</h2>
    <Swiper {...SLIDER_PARAMETERS}
            onSwiper={swiper => setSwiperInstance(swiper)}
            onSlideChange={swiper => handleOnSlideChange(swiper)}
            className={`wrapper`}
            activeSlideKey={selectedCityIndex}
    >
      {years.map(year => {
        return <SwiperSlide key={year.name}>
          {({ isActive }) => <div key={year.year}>{year.year} <br /> {year.description}</div>}
        </SwiperSlide>;
      })}
    </Swiper>
  </section>;
};

Timeline.propTypes = {
  title: PropTypes.string,
  years: PropTypes.arrayOf(PropTypes.object).isRequired,
  findSelectedCityNameByIndex: PropTypes.func.isRequired,
  selectedCityIndex: PropTypes.number
};

Timeline.defaultProps = {};

export default Timeline;
