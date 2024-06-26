import { ArticleType } from "@application/dto/article/articleDTO";
import type { ArticleDTO } from "@application/dto/article/articleDTO";
import type { ArticleCardAuthorProps } from "@components/organisms/articleCard/components/articleCardAuthor";
import { ArticleCardAuthor } from "@components/organisms/articleCard/components/articleCardAuthor";
import type { ArticleCardExcerptProps } from "@components/organisms/articleCard/components/articleCardExcerpt";
import { ArticleCardExcerpt } from "@components/organisms/articleCard/components/articleCardExcerpt";
import { ArticleCardImage } from "@components/organisms/articleCard/components/articleCardImage";
import type { ArticleCardImageProps } from "@components/organisms/articleCard/components/articleCardImage";
import type { ArticleCardPublishDateProps } from "@components/organisms/articleCard/components/articleCardPublishDate";
import { ArticleCardPublishDate } from "@components/organisms/articleCard/components/articleCardPublishDate";
import type { ArticleCardTagItemProps } from "@components/organisms/articleCard/components/articleCardTagItem";
import { ArticleCardTagItem } from "@components/organisms/articleCard/components/articleCardTagItem";
import type { ArticleCardTagsListProps } from "@components/organisms/articleCard/components/articleCardTagsList";
import { ArticleCardTagsList } from "@components/organisms/articleCard/components/articleCardTagsList";
import type { ArticleCardTitleProps } from "@components/organisms/articleCard/components/articleCardTitle";
import { ArticleCardTitle } from "@components/organisms/articleCard/components/articleCardTitle";
import { getLocation } from "@components/organisms/articleCard/utils/getLocation";
import clsx from "clsx";

type ArticleCardProps = {
	origin: Location;
} & ArticleDTO["data"];

export const ArticleCard = ({ children, origin, href, title, variant }: ArticleCardProps) => {
	const location = getLocation(origin);

	return (
		<>
			<a className={"article__link-card"} href={href} aria-label={title}>
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
