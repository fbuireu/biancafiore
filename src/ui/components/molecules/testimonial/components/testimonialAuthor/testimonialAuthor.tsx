import React, { type FunctionComponent, type ReactNode } from 'react';
import './testimonialAuthor.css';

export interface TestimonialAuthorProps {
    children: ReactNode;
}

export const TestimonialAuthor: FunctionComponent<TestimonialAuthorProps> = ({ children }) => (
    <h4 className="testimonial__author">{children}</h4>
);
