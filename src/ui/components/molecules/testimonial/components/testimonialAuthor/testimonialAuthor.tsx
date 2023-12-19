import React, { type FC, type ReactNode } from 'react';
import 'src/ui/components/molecules/testimonial/components/testimonialAuthor/testimonialAuthor.css';

export interface TestimonialAuthorProps {
  children: ReactNode;
}

export const TestimonialAuthor: FC<TestimonialAuthorProps> = ({ children }) => (
  <h4 className="testimonial__author">{children}</h4>
);
