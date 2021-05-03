import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import './Timeline.scss';

const Timeline = ({ title, years, selectedCityIndex }) => {
  const [swiper, setSwiper] = useState(null);

  useEffect(function slideTo () {
    if(selectedCityIndex) swiper.slideTo(selectedCityIndex);
  }, [selectedCityIndex, swiper]);

  const SLIDER_PARAMETERS = {
    loop: false,
    centeredSlides: true,
    breakpoints: {
      1024: {
        // slidesPerView: 1.85,
        spaceBetween: 150
      },
      320: {
        slidesPerView: 1
      }
    }
  };

  return <section>
    <h2>{title}</h2>
    <Swiper {...SLIDER_PARAMETERS} onSwiper={swiperInstance => setSwiper(swiperInstance)} className={`wrapper`}>
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
  selectedCityIndex: PropTypes.number
};

Timeline.defaultProps = {};

export default Timeline;
