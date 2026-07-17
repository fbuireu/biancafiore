import type { testimonialsSchema } from "@application/entities/testimonials";
import type { z } from "astro/zod";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type TestimonialSkeleton = EntrySkeletonType<
	{
		author: EntryFieldTypes.Text;
		quote: EntryFieldTypes.Text;
		image: EntryFieldTypes.AssetLink;
		role: EntryFieldTypes.Text;
	},
	"testimonial"
>;

export type RawTestimonial = Entry<TestimonialSkeleton, undefined>;

export type TestimonialDTO = z.infer<typeof testimonialsSchema>;
