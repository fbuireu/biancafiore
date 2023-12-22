import React, { type FunctionComponent, type ReactNode } from 'react';
import './testimonialDescription.css';

export interface TestimonialDescriptionProps {
    children: ReactNode;
}

export const TestimonialDescription: FunctionComponent<TestimonialDescriptionProps> = ({ children }) => (
    <p className="testimonial__description">{children}</p>
);
