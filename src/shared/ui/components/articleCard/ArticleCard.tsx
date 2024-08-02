import type { ArticleDTO } from "@application/dto/article/types.ts";
import { ArticleType } from "@application/dto/article/types.ts";
import { getLocation } from "@shared//ui/utils/getLocation";
import { ArticleCardAuthor } from "@shared/ui/components/articleCard/atoms/articleCardAuthor";
import type { ArticleCardAuthorProps } from "@shared/ui/components/articleCard/atoms/articleCardAuthor";
import { ArticleCardExcerpt } from "@shared/ui/components/articleCard/atoms/articleCardExcerpt";
import type { ArticleCardExcerptProps } from "@shared/ui/components/articleCard/atoms/articleCardExcerpt";
import type { ArticleCardImageProps } from "@shared/ui/components/articleCard/atoms/articleCardImage";
import { ArticleCardImage } from "@shared/ui/components/articleCard/atoms/articleCardImage";
import { ArticleCardPublishDate } from "@shared/ui/components/articleCard/atoms/articleCardPublishDate";
import type { ArticleCardPublishDateProps } from "@shared/ui/components/articleCard/atoms/articleCardPublishDate";
import { ArticleCardTagItem } from "@shared/ui/components/articleCard/atoms/articleCardTagItem";
import type { ArticleCardTagItemProps } from "@shared/ui/components/articleCard/atoms/articleCardTagItem";
import { ArticleCardTagsList } from "@shared/ui/components/articleCard/atoms/articleCardTagsList";
import type { ArticleCardTagsListProps } from "@shared/ui/components/articleCard/atoms/articleCardTagsList";
import { ArticleCardTitle } from "@shared/ui/components/articleCard/atoms/articleCardTitle";
import type { ArticleCardTitleProps } from "@shared/ui/components/articleCard/atoms/articleCardTitle";
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
const Tags = ({ children }: ArticleCardTagsListProps) => <ArticleCardTagsList>{children}</ArticleCardTagsList>;
const Tag = ({ children, tag }: ArticleCardTagItemProps) => (
	<ArticleCardTagItem tag={tag}>{children}</ArticleCardTagItem>
);

ArticleCard.Title = Title;
ArticleCard.Author = Author;
ArticleCard.Excerpt = Excerpt;
ArticleCard.Image = Image;
ArticleCard.PublishDate = PublishDate;
ArticleCard.Tags = Tags;
ArticleCard.Tag = Tag;
