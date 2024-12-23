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
import { getLocation } from "@modules/core/utils/getLocation";
import clsx from "clsx";
import type { JSX, ReactNode } from "react";
import "./article-card.css";

interface ArticleCardProps extends CollectionEntry<"articles"> {
	origin: URL;
	children: ReactNode;
}

export const ArticleCard = ({ children, origin, data }: ArticleCardProps): JSX.Element => {
	const location = getLocation(origin);

	return (
		<>
			<a className={"article-card__link"} href={`${PAGES_ROUTES.ARTICLES}/${data.slug}`} aria-label={data.title}>
				{" "}
			</a>
			<article
				className={clsx("article-card__item", articleVariantToClass(data.variant), location && `--is-${location}`)}
			>
				{children}
			</article>
		</>
	);
};

const Image = (props: ArticleCardImageProps): JSX.Element => <ArticleCardImage {...props} />;
const Title = ({ children }: ArticleCardTitleProps): JSX.Element => <ArticleCardTitle>{children}</ArticleCardTitle>;
const Author = ({ children, slug }: ArticleCardAuthorProps): JSX.Element => (
	<ArticleCardAuthor slug={slug}>{children}</ArticleCardAuthor>
);
const Excerpt = ({ children }: ArticleCardExcerptProps): JSX.Element => (
	<ArticleCardExcerpt>{children}</ArticleCardExcerpt>
);
const PublishDate = ({ children, publishDate }: ArticleCardPublishDateProps): JSX.Element => (
	<ArticleCardPublishDate publishDate={publishDate}>{children}</ArticleCardPublishDate>
);
const ReadingTime = ({ children }: ArticleCardReadingTimeProps): JSX.Element => (
	<ArticleCardReadingTime>{children}</ArticleCardReadingTime>
);
const Tags = ({ children }: ArticleCardTagsListProps): JSX.Element => (
	<ArticleCardTagsList>{children}</ArticleCardTagsList>
);
const Tag = ({ children, ...props }: ArticleCardTagItemProps): JSX.Element => (
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
