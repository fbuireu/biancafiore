import clsx from 'clsx';
import { ArticleType } from '@application/dto/article/articleDTO.ts';
import type { ArticleDTO } from '@application/dto/article/articleDTO.ts';
import { slugify } from '@shared/ui/utils/slugify';
import './article-card.css'
import { getLocation } from '@components/organisms/articleCard/utils/getLocation';

type ArticleCardProps = {
  origin: Location
} & ArticleDTO['data']

export const ArticleCard = ({
    title,
    description,
    href,
    variant,
    featuredImage,
    publishDate,
    author,
    tags,
  origin
  }: ArticleCardProps) => {
  const location = getLocation(origin)
  return (
    <>
      <a className={`article__link-card`} href={href} aria-label={title} />
      <article
        className={clsx(
          "article__item",
          {
            "--default-variant": variant === ArticleType.DEFAULT,
            "--no-image-variant": variant === ArticleType.NO_IMAGE,
          },
          location && `--is-${location}`
        )}
      >
        {featuredImage && (
          <img
            className={`article__item__featured-image`}
            src={featuredImage}
            alt={title}
            loading="lazy"
            decoding="async"
          />
        )}
        <time className={`article__item__publish-date`} dateTime={publishDate}>
          {publishDate}
        </time>
        <h3 className="article__title font-serif inner-section-title">{title}</h3>
        <p className={`article__author`}>
          by <a href={`/tags/${author.data?.id}`}>{author.data.name}</a>
        </p>
        <p className={`article__excerpt`}>{description}</p>
        <ul className="article__tags__list flex">
          {tags?.map((tag: string) => (
            <a key={tag} className="article__tag__item" href={`/tags/${slugify(tag)}`}>
              #{tag}
            </a>
          ))}
        </ul>
      </article>
    </>
  );
};
