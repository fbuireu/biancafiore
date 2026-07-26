import type { AuthorSkeleton } from "@application/dto/author/types";
import type { TagSkeleton } from "@application/dto/tag/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type ArticleSkeleton = EntrySkeletonType<
	{
		title: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
		content: EntryFieldTypes.RichText;
		description?: EntryFieldTypes.Text;
		publishDate: EntryFieldTypes.Date;
		featuredImage?: EntryFieldTypes.AssetLink;
		featuredArticle: EntryFieldTypes.Boolean;
		isFavorite?: EntryFieldTypes.Boolean;
		isRepublished?: EntryFieldTypes.Boolean;
		originalSource?: EntryFieldTypes.Text;
		author: EntryFieldTypes.EntryLink<AuthorSkeleton>;
		tags?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TagSkeleton>>;
		relatedArticles?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<EntrySkeletonType>>;
	},
	"article"
>;

export type RawArticle = Entry<ArticleSkeleton, undefined>;
