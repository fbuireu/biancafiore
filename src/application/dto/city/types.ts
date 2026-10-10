import type { CmsEntry } from "@infrastructure/cms/entries";
import type { RawImage } from "../shared/images";

export interface CityFields {
	name: string;
	latitude: number;
	longitude: number;
	start_date: string;
	end_date?: string;
	description: string;
	image: RawImage;
}

export type RawCity = CmsEntry<CityFields>;
