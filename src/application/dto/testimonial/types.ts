import type { ContentfulImageAsset, Image } from "@shared/application/types";
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

export interface TestimonialDTO {
	author: string;
	quote: string;
	image: Image;
	role: string;
}
