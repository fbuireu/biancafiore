import React, { type FC, type ReactNode } from 'react';

interface RenderChildrenProps {
  children: ReactNode;
}

type SlideProps = RenderChildrenProps;

type ImageProps = Pick<HTMLImageElement, 'src' | 'alt'>;
export const Slide: FC<SlideProps> & {
  Title: FC<RenderChildrenProps>;
  Quote: FC<RenderChildrenProps>;
  Role: FC<RenderChildrenProps>;
  Image: FC<ImageProps>;
} = ({ children }) => {
  return (
    <div className="slide-container">
      <div className="slide-content">{children}</div>
    </div>
  );
};

const Title: FC<RenderChildrenProps> = ({ children }) => <h4>{children}</h4>;

const Quote: FC<RenderChildrenProps> = ({ children }) => <blockquote className="quote">{children}</blockquote>;

const Role: FC<RenderChildrenProps> = ({ children }) => <p className="role">{children}</p>;

const Image: FC<ImageProps> = ({ src, alt }) => <img src={src} alt={alt} decoding="async" loading="lazy" />;

Slide.Title = Title;
Slide.Quote = Quote;
Slide.Role = Role;
Slide.Image = Image;
