import React, { type FC, type ReactNode } from 'react';
import './testimonialQuote.css';

export interface TestimonialQuoteProps {
  children: ReactNode;
}

export const TestimonialQuote: FC<TestimonialQuoteProps> = ({ children }) => (
  <blockquote className="testimonial__quote">{children}</blockquote>
);
