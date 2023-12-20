import React, { type FC, type ReactNode } from 'react';
import 'src/ui/components/molecules/testimonial/components/testimonialQuote/testimonialQuote.css';
import doubleQuote from '@assets/images/svg/double-quote.svg';

export interface TestimonialQuoteProps {
    children: ReactNode;
}

export const TestimonialQuote: FC<TestimonialQuoteProps> = ({ children }) => (
    <div className="testimonial__quote__wrapper">
        <img className="testimonial__quote-symbol" src={doubleQuote.src} alt={'Quote'} />
        <blockquote className="testimonial__quote">{children}</blockquote>
    </div>
);
