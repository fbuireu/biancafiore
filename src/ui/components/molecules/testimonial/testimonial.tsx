import React, { type FunctionComponent, type ReactNode } from 'react';
import './testimonial.css';
import {
    TestimonialImage,
    type TestimonialImageProps,
} from 'src/ui/components/molecules/testimonial/components/testimonialImage';
import {
    TestimonialQuote,
    type TestimonialQuoteProps,
} from 'src/ui/components/molecules/testimonial/components/testimonialQuote';
import {
    TestimonialDescription,
    type TestimonialDescriptionProps,
} from 'src/ui/components/molecules/testimonial/components/testimonialDescription';
import {
    TestimonialAuthor,
    type TestimonialAuthorProps,
} from 'src/ui/components/molecules/testimonial/components/testimonialAuthor';
import { useSwiperSlide } from 'swiper/react';

interface TestimonialProps {
    children: ReactNode;
}

export const Testimonial: FunctionComponent<TestimonialProps> & {
    Author: FunctionComponent<TestimonialAuthorProps>;
    Quote: FunctionComponent<TestimonialQuoteProps>;
    Description: FunctionComponent<TestimonialDescriptionProps>;
    Image: FunctionComponent<TestimonialImageProps>;
} = ({ children }) => {
    const { isActive } = useSwiperSlide();

    return <article className={`testimonial__content ${isActive ? `--is-active` : ``}`}>{children}</article>;
};

const Image: FunctionComponent<TestimonialImageProps> = (props) => <TestimonialImage {...props} />;

const Quote: FunctionComponent<TestimonialQuoteProps> = ({ children }) => (
    <TestimonialQuote>{children}</TestimonialQuote>
);

const Author: FunctionComponent<TestimonialAuthorProps> = ({ children }) => (
    <TestimonialAuthor>{children}</TestimonialAuthor>
);

const Description: FunctionComponent<TestimonialDescriptionProps> = ({ children }) => (
    <TestimonialDescription>{children}</TestimonialDescription>
);

Testimonial.Author = Author;
Testimonial.Quote = Quote;
Testimonial.Description = Description;
Testimonial.Image = Image;
