import React, { type ReactNode } from 'react';
import './testimonial-description.css';

export interface TestimonialDescriptionProps {
  children: ReactNode;
}

export const TestimonialDescription = ({ children }: TestimonialDescriptionProps) => (
  <p className="testimonial__description">{children}</p>
);
