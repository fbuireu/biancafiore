import type { ArticleDTO } from "@application/dto/article/types.ts";
import { ArticleType } from "@application/dto/article/types.ts";
import type { ArticleCardAuthorProps } from "@ui/modules/core/components/articleCard/atoms/articleCardAuthor";
import { ArticleCardAuthor } from "@ui/modules/core/components/articleCard/atoms/articleCardAuthor";
import type { ArticleCardExcerptProps } from "@ui/modules/core/components/articleCard/atoms/articleCardExcerpt";
import { ArticleCardExcerpt } from "@ui/modules/core/components/articleCard/atoms/articleCardExcerpt";
import type { ArticleCardImageProps } from "@ui/modules/core/components/articleCard/atoms/articleCardImage";
import { ArticleCardImage } from "@ui/modules/core/components/articleCard/atoms/articleCardImage";
import type { ArticleCardPublishDateProps } from "@ui/modules/core/components/articleCard/atoms/articleCardPublishDate";
import { ArticleCardPublishDate } from "@ui/modules/core/components/articleCard/atoms/articleCardPublishDate";
import type { ArticleCardReadingTimeProps } from "@ui/modules/core/components/articleCard/atoms/articleCardReadingTime";
import { ArticleCardReadingTime } from "@ui/modules/core/components/articleCard/atoms/articleCardReadingTime";
import type { ArticleCardTagItemProps } from "@ui/modules/core/components/articleCard/atoms/articleCardTagItem";
import { ArticleCardTagItem } from "@ui/modules/core/components/articleCard/atoms/articleCardTagItem";
import type { ArticleCardTagsListProps } from "@ui/modules/core/components/articleCard/atoms/articleCardTagsList";
import { ArticleCardTagsList } from "@ui/modules/core/components/articleCard/atoms/articleCardTagsList";
import type { ArticleCardTitleProps } from "@ui/modules/core/components/articleCard/atoms/articleCardTitle";
import { ArticleCardTitle } from "@ui/modules/core/components/articleCard/atoms/articleCardTitle";
import { getLocation } from "@ui/modules/core/utils/getLocation";
import clsx from "clsx";
import type { ReactNode } from "react";
import "./article-card.css";

interface ArticleCardProps extends ArticleDTO {
	origin: URL;
	children: ReactNode;
}

export const ArticleCard = ({ children, origin, title, slug, variant }: ArticleCardProps) => {
	const location = getLocation(origin);

	return (
		<>
			<a className={"article__link-card"} href={`/articles/${slug}`} aria-label={title}>
				{" "}
			</a>
			<article
				className={clsx(
					"article__item",
					{
						"--default-variant": variant === ArticleType.DEFAULT,
						"--no-image-variant": variant === ArticleType.NO_IMAGE,
					},
					location && `--is-${location}`,
				)}
			>
				{children}
			</article>
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
const Tag = ({ children, tag }: ArticleCardTagItemProps) => (
	<ArticleCardTagItem tag={tag}>{children}</ArticleCardTagItem>
);

ArticleCard.Title = Title;
ArticleCard.Author = Author;
ArticleCard.Excerpt = Excerpt;
ArticleCard.Image = Image;
ArticleCard.ReadingTime = ReadingTime;
ArticleCard.PublishDate = PublishDate;
ArticleCard.Tags = Tags;
ArticleCard.Tag = Tag;
