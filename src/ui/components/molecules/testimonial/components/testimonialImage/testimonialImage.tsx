import React from 'react';
import './testimonialImage.css';

export type TestimonialImageProps = Pick<HTMLImageElement, 'src' | 'alt'>;

export const TestimonialImage = ({ src, alt }: TestimonialImageProps) => (
  <img className="testimonial__image" src={src} alt={alt} decoding="async" loading="lazy" />
);
