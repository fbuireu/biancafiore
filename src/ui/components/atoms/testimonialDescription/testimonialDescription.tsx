import React, { type FC, type ReactNode } from 'react';
import './testimonialDescription.css';

export interface TestimonialDescriptionProps {
  children: ReactNode;
}

export const TestimonialDescription: FC<TestimonialDescriptionProps> = ({ children }) => (
  <p className="testimonial__description">{children}</p>
);
