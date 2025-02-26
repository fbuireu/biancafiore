import type { z } from "astro:content";
import type { testimonialsSchema } from "@application/entities/testimonials";
import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawTestimonial {
	contentTypeId: "testimonial";
	fields: {
		author: EntryFieldTypes.Text;
		quote: EntryFieldTypes.Text;
		image: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>;
		role: EntryFieldTypes.Text;
	};
}

export type TestimonialDTO = z.infer<typeof testimonialsSchema>;
