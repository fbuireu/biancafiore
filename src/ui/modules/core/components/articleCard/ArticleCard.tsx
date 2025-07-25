import type { CollectionEntry } from "astro:content";
import { PAGES_ROUTES } from "@const/index";
import type { ArticleCardAuthorProps } from "@modules/core/components/articleCard/atoms/articleCardAuthor";
import { ArticleCardAuthor } from "@modules/core/components/articleCard/atoms/articleCardAuthor";
import type { ArticleCardExcerptProps } from "@modules/core/components/articleCard/atoms/articleCardExcerpt";
import { ArticleCardExcerpt } from "@modules/core/components/articleCard/atoms/articleCardExcerpt";
import type { ArticleCardImageProps } from "@modules/core/components/articleCard/atoms/articleCardImage";
import { ArticleCardImage } from "@modules/core/components/articleCard/atoms/articleCardImage";
import type { ArticleCardPublishDateProps } from "@modules/core/components/articleCard/atoms/articleCardPublishDate";
import { ArticleCardPublishDate } from "@modules/core/components/articleCard/atoms/articleCardPublishDate";
import type { ArticleCardReadingTimeProps } from "@modules/core/components/articleCard/atoms/articleCardReadingTime";
import { ArticleCardReadingTime } from "@modules/core/components/articleCard/atoms/articleCardReadingTime";
import type { ArticleCardTagItemProps } from "@modules/core/components/articleCard/atoms/articleCardTagItem";
import { ArticleCardTagItem } from "@modules/core/components/articleCard/atoms/articleCardTagItem";
import type { ArticleCardTagsListProps } from "@modules/core/components/articleCard/atoms/articleCardTagsList";
import { ArticleCardTagsList } from "@modules/core/components/articleCard/atoms/articleCardTagsList";
import type { ArticleCardTitleProps } from "@modules/core/components/articleCard/atoms/articleCardTitle";
import { ArticleCardTitle } from "@modules/core/components/articleCard/atoms/articleCardTitle";
import { articleVariantToClass } from "@modules/core/utils/articleVariantToClass";
import clsx from "clsx";
import type { ReactNode } from "react";
import "./article-card.css";

interface ArticleCardProps extends CollectionEntry<"articles"> {
	children: ReactNode;
}

export const ArticleCard = ({ children, data }: ArticleCardProps) => {
	return (
		<>
			<a className={"article-card__link"} href={`${PAGES_ROUTES.ARTICLES}/${data.slug}`} aria-label={data.title}>
				{" "}
			</a>
			<article className={clsx("article-card__item", articleVariantToClass(data.variant))}>{children}</article>
		</>
	);
};

const Image = (props: ArticleCardImageProps) => <ArticleCardImage {...props} />;
const Title = ({ children }: ArticleCardTitleProps) => <ArticleCardTitle>{children}</ArticleCardTitle>;
const Author = ({ children, slug }: ArticleCardAuthorProps) => (
	<ArticleCardAuthor slug={slug}>{children}</ArticleCardAuthor>
);
const Excerpt = ({ children }: ArticleCardExcerptProps) => <ArticleCardExcerpt>{children}</ArticleCardExcerpt>;
const PublishDate = ({ children, publishDate }: ArticleCardPublishDateProps) => (
	<ArticleCardPublishDate publishDate={publishDate}>{children}</ArticleCardPublishDate>
);
const ReadingTime = ({ children }: ArticleCardReadingTimeProps) => (
	<ArticleCardReadingTime>{children}</ArticleCardReadingTime>
);
const Tags = ({ children }: ArticleCardTagsListProps) => <ArticleCardTagsList>{children}</ArticleCardTagsList>;
const Tag = ({ children, ...props }: ArticleCardTagItemProps) => (
	<ArticleCardTagItem {...props}>{children}</ArticleCardTagItem>
);

ArticleCard.Title = Title;
ArticleCard.Author = Author;
ArticleCard.Excerpt = Excerpt;
ArticleCard.Image = Image;
ArticleCard.ReadingTime = ReadingTime;
ArticleCard.PublishDate = PublishDate;
ArticleCard.Tags = Tags;
ArticleCard.Tag = Tag;
