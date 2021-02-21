import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import Testimonial from '../../atoms/Testimonial/Testimonial';
import './Testimonials.scss';

const Testimonials = ({ title, subtitle, testimonials }) => {
  return <section className={`testimonials__wrapper`}>
    <h2>{title}</h2>
    <Markdown>{subtitle}</Markdown>
    <Swiper>
      {testimonials.map(testimonial => {
        return <SwiperSlide key={testimonial.name}>
          <Testimonial {...testimonial} />
        </SwiperSlide>;
      })}
    </Swiper>
  </section>;
};

Testimonials.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  testimonials: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Testimonials.defaultProps = {};

export default Testimonials;
