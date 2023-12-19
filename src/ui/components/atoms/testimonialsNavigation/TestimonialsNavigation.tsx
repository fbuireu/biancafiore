import React from 'react';
import './testimonialsNavigation.css';
import { useSwiper } from 'swiper/react';
import horizontalArrow from '@assets/images/svg/left-arrow.svg';

export const TestimonialsNavigation = () => {
  const swiper = useSwiper();
  console.log('swiper', swiper);
  return (
    <div className="testimonials__navigation flex column-nowrap">
      <button className="testimonials__navigation__button --right clickable" onClick={() => swiper.slideNext()}>
        <img src={horizontalArrow.src} alt={'Next testimonial'} />
      </button>
      <button className="testimonials__navigation__button --left clickable" onClick={() => swiper.slidePrev()}>
        <img src={horizontalArrow.src} alt={'Previous testimonial'} />
      </button>
    </div>
  );
};
