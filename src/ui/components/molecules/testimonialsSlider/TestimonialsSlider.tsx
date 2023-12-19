import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Navigation, Pagination, Virtual } from 'swiper/modules';
import { Testimonial } from '@components/molecules/testimonial';
import { type SwiperOptions } from 'swiper/types';
import { TestimonialsNavigation } from 'src/ui/components/molecules/testimonialsSlider/components/testimonialsNavigation';
import './testimonialsSlider.css';

const SLIDER_CONFIG: SwiperOptions = {
  modules: [Navigation, Pagination, Keyboard, Virtual, A11y],
  loop: true,
  centeredSlides: true,
  slidesPerView: 3,
  autoplay: {
    delay: 3000,
    pauseOnMouseEnter: true,
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
            <Testimonial.Author>Ferran Buireu</Testimonial.Author>
            <Testimonial.Quote>
              Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
              lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
              Yellow Jack fathom broadside snow clipper quarter.
            </Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Ferran Buireu</Testimonial.Author>
            <Testimonial.Quote>
              Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
              lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
              Yellow Jack fathom broadside snow clipper quarter.
            </Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Ferran Buireu</Testimonial.Author>
            <Testimonial.Quote>
              Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
              lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
              Yellow Jack fathom broadside snow clipper quarter.
            </Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Ferran Buireu</Testimonial.Author>
            <Testimonial.Quote>
              Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye.
            </Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <SwiperSlide>
          <Testimonial>
            <Testimonial.Author>Ferran Buireu</Testimonial.Author>
            <Testimonial.Quote>
              Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye.
            </Testimonial.Quote>
            <Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
            <Testimonial.Description>role</Testimonial.Description>
          </Testimonial>
        </SwiperSlide>
        <TestimonialsNavigation />
      </Swiper>
    </div>
  );
};
