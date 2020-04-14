import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import Navigation from '../../molecules/Navigation/Navigation';
import ShareButtons from '../../molecules/ShareButtons/ShareButtons';
import Billboard from '../../organisms/Billboard/Billboard';
import SEO from '../../organisms/SEO/SEO';
import Layout from '../Layout/Layout';
import './Article.scss';

export const Article = ({ data }) => {
  const [scroll, setScroll] = useState(0),
    [articleProperties, setArticleProperties] = useState({}),
    articleReference = useRef(null),
    { article, site } = data,
    shareParameters = {
      author: site.siteMetadata.author,
      parameters: {
        domain: site.siteMetadata.url,
        url: `${site.siteMetadata.url}${article.fields.slug}`,
        title: article.frontmatter.content.title,
        description: article.frontmatter.content.summary || article.frontmatter.seo.metaDescription,
      },
    },
    tags = article.frontmatter.content.tags.map(tag => tag.split(` `).join(``));

  useEffect(() => setArticleProperties(articleReference.current), []);

  useScrollPosition(({ currentPosition }) => setScroll(currentPosition.y));

  return <Layout>
    <SEO title={article.frontmatter.content.title} />
    <Billboard {...article} />
    <section className={`wrapper article__wrapper`}>
      <ShareButtons shareParameters={shareParameters} tags={tags} />
      <article ref={articleReference} dangerouslySetInnerHTML={{ __html: article.html }} />
    </section>
    <ReadingProgress scroll={scroll} articleProperties={articleProperties} />
  </Layout>;
};

export const articleData = graphql`
    query getArticleBySlug($slug: String!) {
        article:markdownRemark(fields: { slug: { eq: $slug }}) {
            html
            fields {
                slug
            }
            frontmatter {
                key
                language
                seo {
                    author
                    metaDescription
                }
                content {
                    title
                    summary
                    publishDate
                    lastUpdated
                    readingTime
                    isFeaturedPost
                    featuredImage
                    tags
                }
            }
        }
        site {
            siteMetadata {
                url
                author
            }
        }
    }
`;

Article.propTypes = {
  data: PropTypes.object.isRequired,
};

Navigation.defaultProps = {};

export default Article;
