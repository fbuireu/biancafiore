import React, { type ReactNode } from 'react';
import './testimonial-quote.css';
import doubleQuote from '@assets/images/svg/double-quote.svg';

export interface TestimonialQuoteProps {
    children: ReactNode;
}

export const TestimonialQuote = ({ children }: TestimonialQuoteProps) => (
    <div className="testimonial__quote__wrapper">
        <img className="testimonial__quote-symbol" src={doubleQuote.src} alt={'Quote'} />
        <blockquote className="testimonial__quote">{children}</blockquote>
    </div>
);
