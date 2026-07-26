import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type TagSkeleton = EntrySkeletonType<
	{
		name: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
	},
	"tag"
>;

export type RawTag = Entry<TagSkeleton, undefined>;
