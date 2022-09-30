import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import Testimonial from '../../atoms/Testimonial/Testimonial'
import './Testimonials.scss'
import 'swiper/css'
import React from 'react'

SwiperCore.use([Navigation])

const SLIDER_PARAMETERS = {
  loop: true,
  navigation: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
  },
  centeredSlides: true,
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
};

const Testimonials = ({ title, subtitle, testimonials }) => {
  return (
    <section className={`testimonials__wrapper`}>
      <h2 className={`testimonials__title`}>{title}</h2>
      <Markdown className={`testimonials__subtitle`}>{subtitle}</Markdown>
      <Swiper {...SLIDER_PARAMETERS} className={`testimonials__slider wrapper`}>
        {testimonials.map((testimonial) => {
          return (
            <SwiperSlide key={testimonial.name}>
              {({ isActive }) => (
                <Testimonial {...testimonial} isActive={isActive}/>
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
};

Testimonials.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  testimonials: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Testimonials.defaultProps = {};

export default Testimonials;
