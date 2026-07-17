import type { authorSchema } from "@application/entities/authors";
import type { Reference } from "@shared/application/types";
import type { z } from "astro/zod";
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

export type AuthorDTO = z.infer<typeof authorSchema> & {
	articles: Reference<"articles">[];
	latestArticle?: Reference<"articles">;
};
