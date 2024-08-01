import { Image } from "@shared/ui/components/Image";
import "./testimonial-image.css";

export type TestimonialImageProps = Pick<HTMLImageElement, "src" | "alt">;

export const TestimonialImage = ({ src, alt }: TestimonialImageProps) => (
	<Image classNames="testimonial__image" src={src} alt={alt} />
);
