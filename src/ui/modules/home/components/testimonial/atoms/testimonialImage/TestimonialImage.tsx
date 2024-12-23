import { Picture } from "@modules/core/components/picture";
import type { ImageFormats } from "@shared/application/types";
import "./testimonial-image.css";
import type { JSX } from "react";

export interface TestimonialImageProps extends Pick<HTMLImageElement, "src" | "alt"> {
	formats: ImageFormats;
}

export const TestimonialImage = (props: TestimonialImageProps): JSX.Element => (
	<Picture classNames="testimonial__image" {...props} />
);
