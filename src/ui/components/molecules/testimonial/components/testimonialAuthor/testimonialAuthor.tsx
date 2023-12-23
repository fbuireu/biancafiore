import React, { type ReactNode } from 'react';
import './testimonialAuthor.css';

export interface TestimonialAuthorProps {
  children: ReactNode;
}

export const TestimonialAuthor = ({ children }: TestimonialAuthorProps) => (
  <h4 className="testimonial__author">{children}</h4>
);
