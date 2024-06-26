import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import { ArticleType } from "@application/dto/article/articleDTO.ts";
import { ArticleCardExcerpt } from "@components/organisms/articleCard/components/articleCardExcerpt";
import {
	ArticleCardImage,
	type ArticleCardImageProps,
} from "@components/organisms/articleCard/components/articleCardImage";
import { getLocation } from "@components/organisms/articleCard/utils/getLocation";
import clsx from "clsx";
import "./article-card.css";
import {
	ArticleCardAuthor,
	type ArticleCardAuthorProps,
} from "@components/organisms/articleCard/components/articleCardAuthor";
import {
	ArticleCardPublishDate,
	type ArticleCardPublishDateProps,
} from "@components/organisms/articleCard/components/articleCardPublishDate";
import {
	ArticleCardTagItem,
	type ArticleCardTagItemProps,
} from "@components/organisms/articleCard/components/articleCardTagItem";
import {
	ArticleCardTagsList,
	type ArticleCardTagsListProps,
} from "@components/organisms/articleCard/components/articleCardTagsList";
import {
	ArticleCardTitle,
	type ArticleCardTitleProps,
} from "@components/organisms/articleCard/components/articleCardTitle";

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
const Excerpt = ({ children }: ArticleCardExcerpt) => <ArticleCardExcerpt>{children}</ArticleCardExcerpt>;
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
