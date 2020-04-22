import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import Author from '../../molecules/Author/Author';
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
    { article, site, author } = data,
    shareParameters = {
      author: site.siteMetadata.author,
      parameters: {
        domain: site.siteMetadata.url,
        url: `${site.siteMetadata.url}${article.fields.slug}`,
        title: article.frontmatter.content.title,
        description: article.frontmatter.content.summary || article.excerpt,
      },
    },
    tags = article.frontmatter.content.tags;

  useEffect(() => setArticleProperties(articleReference.current), []);

  useScrollPosition(({ currentPosition }) => setScroll(currentPosition.y));

  return <Layout>
    <SEO title={article.frontmatter.content.title} />
    <Billboard {...article} author={author} />
    <section className={`wrapper article__wrapper`}>
      <ShareButtons shareParameters={shareParameters} tags={tags} />
      <article ref={articleReference} dangerouslySetInnerHTML={{ __html: article.html }} />
      <Author author={author} tags={tags} />
    </section>
    <ReadingProgress scroll={scroll} articleProperties={articleProperties} />
  </Layout>;
};

export const articleData = graphql`
    query getArticleBySlug($slug: String!, $author: String) {
        article: markdownRemark(fields: { slug: { eq: $slug }}) {
            html
            excerpt(pruneLength: 350)
            fields {
                slug
            }
            frontmatter {
                key
                language
                author
                seo {
                    metaDescription
                }
                content {
                    title
                    summary
                    publishDate
                    lastUpdated
                    readingTime
                    isFeaturedPost
                    featuredImage {
                        childImageSharp {
                            fluid(maxWidth: 800) {
                                ...GatsbyImageSharpFluid
                            }
                        }
                    }
                    tags
                }
            }
        }
        author: markdownRemark(frontmatter: {name: {eq: $author}}) {
            frontmatter {
                slug
                name
                image {
                    childImageSharp {
                        fluid(maxWidth: 800) {
                            ...GatsbyImageSharpFluid
                        }
                    }
                }
                description
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
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

Article.defaultProps = {};

export default Article;
