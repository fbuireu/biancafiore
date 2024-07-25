import "./testimonial-image.css";
import { Image } from "@components/atoms/Image";

export type TestimonialImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const TestimonialImage = ({ src, alt }: TestimonialImageProps) => (
	<Image classNames="testimonial__image" src={src} alt={alt} />
);
