import React, { type FunctionComponent, type ReactNode } from 'react';
import './testimonialQuote.css';
import doubleQuote from '@assets/images/svg/double-quote.svg';

export interface TestimonialQuoteProps {
    children: ReactNode;
}

export const TestimonialQuote: FunctionComponent<TestimonialQuoteProps> = ({ children }) => (
    <div className="testimonial__quote__wrapper">
        <img className="testimonial__quote-symbol" src={doubleQuote.src} alt={'Quote'} />
        <blockquote className="testimonial__quote">{children}</blockquote>
    </div>
);
