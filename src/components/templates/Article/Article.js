import { graphql } from 'gatsby';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../utils/hooks/useScrollPosition';
import Author from '../../atoms/Author/Author';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import SEO from '../../atoms/SEO/SEO';
import ShareButtons from '../../atoms/ShareButtons/ShareButtons';
import RelatedArticles from '../../molecules/RelatedArticles/RelatedArticles';
import Billboard from '../../organisms/Billboard/Billboard';
import Layout from '../Layout/Layout';
import './Article.scss';

const Article = ({ data }) => {
  const [scroll, setScroll] = useState(0),
    [articleProperties, setArticleProperties] = useState({}),
    articleReference = useRef(null),
    { article, author, relatedArticles, site } = data,
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

  useEffect(function setCurrentArticleProperties() {
    setArticleProperties(articleReference.current);
  }, []);

  useScrollPosition(function setScrollPosition({ currentPosition }) {
    setScroll(currentPosition.y);
  });

  return <Layout>
    <SEO title={article.frontmatter.content.title} />
    <Billboard {...article} author={author} tags={tags} />
    <section className={`wrapper article__wrapper`}>
      <ShareButtons shareParameters={shareParameters} tags={tags} scroll={scroll} />
      <article ref={articleReference}>
        <Markdown>{article.html}</Markdown>
      </article>
      <Author author={author} />
      <RelatedArticles relatedArticles={relatedArticles.edges} />
    </section>
    <ReadingProgress scroll={scroll} articleProperties={articleProperties} />
  </Layout>;
};

export const articleData = graphql`
    query getArticleInformation ($slug: String!, $author: String, $tags: [String!]!) {
        article: markdownRemark (fields: { slug: { eq: $slug }}) {
            html
            excerpt (pruneLength: 350)
            fields {
                slug
            }
            frontmatter {
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
                    isFeaturedArticle
                    featuredImage {
                        childImageSharp {
                            fluid {
                                ...GatsbyImageSharpFluid
                            }
                        }
                    }
                    tags
                }
            }
        }
        author: markdownRemark (frontmatter: { name: { eq: $author }}) {
            frontmatter {
                slug
                name
                image {
                    childImageSharp {
                        fluid {
                            ...GatsbyImageSharpFluid
                        }
                    }
                }
                description
            }
        }
        relatedArticles: allMarkdownRemark (
            filter: {
                frontmatter: { content: { tags: { in: $tags }}},
                fields: { slug: { ne: $slug }}},
            sort: {
                fields: frontmatter___content___publishDate,
                order: DESC },
            limit: 3) {
            edges {
                node {
                    excerpt (pruneLength: 350)
                    fields {
                        slug
                    }
                    frontmatter {
                        language
                        content {
                            title
                            summary
                            publishDate
                            lastUpdated
                            readingTime
                            featuredImage {
                                childImageSharp {
                                    fluid {
                                        ...GatsbyImageSharpFluid
                                    }
                                }
                            }
                            tags
                        }
                    }
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
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

Article.defaultProps = {};

export default Article;