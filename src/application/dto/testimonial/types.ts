import type { CmsEntry } from "@infrastructure/cms/entries";
import type { RawImage } from "../shared/images";

export interface TestimonialFields {
	author: string;
	quote: string;
	role: string;
	image: RawImage;
}

export type RawTestimonial = CmsEntry<TestimonialFields>;
