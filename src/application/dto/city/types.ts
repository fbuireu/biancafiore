import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type CitySkeleton = EntrySkeletonType<
	{
		name: EntryFieldTypes.Text;
		coordinates: EntryFieldTypes.Location;
		startDate: EntryFieldTypes.Date;
		endDate?: EntryFieldTypes.Date;
		description: EntryFieldTypes.Text;
		image: EntryFieldTypes.AssetLink;
	},
	"city"
>;

export type RawCity = Entry<CitySkeleton, undefined>;
