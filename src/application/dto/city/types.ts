import type { z } from "astro:content";
import type { citiesSchema } from "@application/entities/cities";
import type { ContenfulLocation, ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawCity {
	contentTypeId: "city";
	fields: {
		name: EntryFieldTypes.Text;
		coordinates: Entry<EntrySkeletonType<ContenfulLocation["fields"]>>;
		startDate: EntryFieldTypes.Date;
		endDate?: EntryFieldTypes.Date;
		description: EntryFieldTypes.Text;
		image: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>;
	};
}

export type CityDTO = z.infer<typeof citiesSchema>;
