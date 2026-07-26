import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type ProjectSkeleton = EntrySkeletonType<
	{
		id?: EntryFieldTypes.Text;
		name: EntryFieldTypes.Text;
		description: EntryFieldTypes.RichText;
		image: EntryFieldTypes.AssetLink;
	},
	"project"
>;

export type RawProject = Entry<ProjectSkeleton, undefined>;
