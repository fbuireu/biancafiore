import { Picture } from "@modules/core/components/picture";
import "./testimonial-image.css";

export interface TestimonialImageProps extends Pick<HTMLImageElement, "src" | "alt"> {}

export const TestimonialImage = (props: TestimonialImageProps) => (
	<Picture classNames="testimonial__image" {...props} />
);
