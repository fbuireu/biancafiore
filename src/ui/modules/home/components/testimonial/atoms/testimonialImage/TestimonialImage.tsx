import { Picture } from "@modules/core/components/picture";
import type { ImageFormats } from "@shared/application/types";
import "./testimonial-image.css";

export interface TestimonialImageProps extends Pick<HTMLImageElement, "src" | "alt"> {
	formats: ImageFormats;
}

export const TestimonialImage = (props: TestimonialImageProps) => (
	<Picture classNames="testimonial__image" {...props} />
);
