import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode, Keyboard, Navigation, Pagination, Virtual } from 'swiper/modules';
import { Testimonial } from '@components/molecules/testimonial';
import { type SwiperOptions } from 'swiper/types';
import { TestimonialsNavigation } from '@components/atoms/testimonialsNavigation';
import './testimonialsSlider.css';

const SLIDER_CONFIG: SwiperOptions = {
  modules: [Navigation, Pagination, FreeMode, Keyboard, Virtual, A11y],
  loop: true,
  centeredSlides: true,
  slidesPerView: 3,
  autoplay: {
    delay: 4000,
    disableOnInteraction: true,
  },
  pagination: {
    clickable: true,
  },
  keyboard: {
    enabled: true,
  },
  breakpoints: {
    1024: {
      slidesPerView: 1.85,
      spaceBetween: 150,
    },
    320: {
      slidesPerView: 1,
    },
  },
  containerModifierClass: 'testimonials-',
};

export const TestimonialsSlider = () => {
  return (
    <div className="testimonials__slider__wrapper common-wrapper">
      <Swiper {...SLIDER_CONFIG}>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Name</Testimonial.Author>
            <Testimonial.Quote>quote</Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Name</Testimonial.Author>
            <Testimonial.Quote>quote</Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Name</Testimonial.Author>
            <Testimonial.Quote>quote</Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Name</Testimonial.Author>
            <Testimonial.Quote>quote</Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Name</Testimonial.Author>
            <Testimonial.Quote>quote</Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Name</Testimonial.Author>
            <Testimonial.Quote>quote</Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <TestimonialsNavigation />
      </Swiper>
    </div>
  );
};
