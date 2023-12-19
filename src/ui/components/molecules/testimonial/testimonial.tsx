import React, { type FC, type ReactNode } from 'react';
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

export const Testimonial: FC<TestimonialProps> & {
  Author: FC<TestimonialAuthorProps>;
  Quote: FC<TestimonialQuoteProps>;
  Description: FC<TestimonialDescriptionProps>;
  Image: FC<TestimonialImageProps>;
} = ({ children }) => {
  const { isActive } = useSwiperSlide();

  return <article className={`testimonial__content ${isActive ? `--is-active` : ``}`}>{children}</article>;
};

const Image: FC<TestimonialImageProps> = (props) => <TestimonialImage {...props} />;

const Quote: FC<TestimonialQuoteProps> = ({ children }) => <TestimonialQuote>{children}</TestimonialQuote>;

const Author: FC<TestimonialAuthorProps> = ({ children }) => <TestimonialAuthor>{children}</TestimonialAuthor>;

const Description: FC<TestimonialDescriptionProps> = ({ children }) => (
  <TestimonialDescription>{children}</TestimonialDescription>
);

Testimonial.Author = Author;
Testimonial.Quote = Quote;
Testimonial.Description = Description;
Testimonial.Image = Image;
