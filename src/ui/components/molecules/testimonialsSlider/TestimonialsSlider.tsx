import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Testimonial } from '@components/atoms/testimonial';

export const TestimonialsSlider = () => {
  return (
    <Swiper navigation={true} modules={[Navigation]} className="mySwiper" slidesPerView={3}>
      <SwiperSlide>
        <Testimonial>
          <Testimonial.Name>Name</Testimonial.Name>
          <Testimonial.Quote>quote</Testimonial.Quote>
          <Testimonial.Image src="https://via.placeholder.com/50" alt="alt" />
          <Testimonial.Description>role</Testimonial.Description>
        </Testimonial>
      </SwiperSlide>
      <SwiperSlide>
        <Testimonial>
          <Testimonial.Name>Name</Testimonial.Name>
          <Testimonial.Quote>quote</Testimonial.Quote>
          <Testimonial.Image src="https://via.placeholder.com/50" alt="alt" />
          <Testimonial.Description>role</Testimonial.Description>
        </Testimonial>
      </SwiperSlide>
      <SwiperSlide>
        <Testimonial>
          <Testimonial.Name>Name</Testimonial.Name>
          <Testimonial.Quote>quote</Testimonial.Quote>
          <Testimonial.Image src="https://via.placeholder.com/50" alt="alt" />
          <Testimonial.Description>role</Testimonial.Description>
        </Testimonial>
      </SwiperSlide>
      <SwiperSlide>
        <Testimonial>
          <Testimonial.Name>Name</Testimonial.Name>
          <Testimonial.Quote>quote</Testimonial.Quote>
          <Testimonial.Image src="https://via.placeholder.com/50" alt="alt" />
          <Testimonial.Description>role</Testimonial.Description>
        </Testimonial>
      </SwiperSlide>
    </Swiper>
  );
};
