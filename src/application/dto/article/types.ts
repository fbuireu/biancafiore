import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";
import type { AuthorSkeleton } from "../author/types";
import type { TagSkeleton } from "../tag/types";

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
