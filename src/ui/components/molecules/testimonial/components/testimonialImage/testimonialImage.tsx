import React, { type FunctionComponent } from 'react';
import './testimonialImage.css';

export type TestimonialImageProps = Pick<HTMLImageElement, 'src' | 'alt'>;

export const TestimonialImage: FunctionComponent<TestimonialImageProps> = ({ src, alt }) => (
    <img className="testimonial__image" src={src} alt={alt} decoding="async" loading="lazy" />
);
