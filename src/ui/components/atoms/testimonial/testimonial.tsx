import React, { type FC, type ReactNode } from 'react';
import './testimonial.css';

interface RenderChildrenProps {
  children: ReactNode;
}

type TestimonialProps = RenderChildrenProps;

type ImageProps = Pick<HTMLImageElement, 'src' | 'alt'>;
export const Testimonial: FC<TestimonialProps> & {
  Name: FC<RenderChildrenProps>;
  Quote: FC<RenderChildrenProps>;
  Description: FC<RenderChildrenProps>;
  Image: FC<ImageProps>;
} = ({ children }) => {
  return (
    <div className="slide__wrapper">
      <div className="slide__content">{children}</div>
    </div>
  );
};

const Image: FC<ImageProps> = ({ src, alt }) => <img src={src} alt={alt} decoding="async" loading="lazy" />;

const Quote: FC<RenderChildrenProps> = ({ children }) => <blockquote className="quote">{children}</blockquote>;

const Name: FC<RenderChildrenProps> = ({ children }) => <h4>{children}</h4>;

const Description: FC<RenderChildrenProps> = ({ children }) => <p className="role">{children}</p>;

Testimonial.Name = Name;
Testimonial.Quote = Quote;
Testimonial.Description = Description;
Testimonial.Image = Image;
