import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type AuthorSkeleton = EntrySkeletonType<
	{
		name: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
		description: EntryFieldTypes.Text;
		jobTitle: EntryFieldTypes.Text;
		currentCompany: EntryFieldTypes.Text;
		profileImage: EntryFieldTypes.AssetLink;
		socialNetworks: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
	},
	"author"
>;

export type RawAuthor = Entry<AuthorSkeleton, undefined>;
