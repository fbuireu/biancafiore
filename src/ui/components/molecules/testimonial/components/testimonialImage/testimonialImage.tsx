import React, { type FC } from 'react';
import 'src/ui/components/molecules/testimonial/components/testimonialImage/testimonialImage.css';

export type TestimonialImageProps = Pick<HTMLImageElement, 'src' | 'alt'>;

export const TestimonialImage: FC<TestimonialImageProps> = ({ src, alt }) => (
  <img className="testimonial__image" src={src} alt={alt} decoding="async" loading="lazy" />
);
