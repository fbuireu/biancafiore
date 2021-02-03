import PropTypes from 'prop-types';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import Testimonial from '../../atoms/Testimonial/Testimonial';

const Testimonials = ({ testimonials }) => {
  return <Swiper>
    {testimonials.map(testimonial => {
      return <SwiperSlide key={testimonial.name}>
        <Testimonial {...testimonial} />
      </SwiperSlide>;
    })
    }
  </Swiper>;
};

Testimonials.propTypes = {
  testimonials: PropTypes.arrayOf(PropTypes.object).isRequired
};

Testimonials.defaultProps = {};

export default Testimonials;
