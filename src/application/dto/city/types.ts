import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';
import type { ContenfulLocation, ContentfulImageAsset, Image, Location } from '@shared/application/types';

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

export interface CityDTO {
	name: string;
	coordinates: Location;
	period: string;
	description: string;
	image: Image;
}
