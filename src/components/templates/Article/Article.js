import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import Author from '../../atoms/Author/Author';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import Seo from '../../atoms/Seo/Seo';
import ShareButtons from '../../atoms/ShareButtons/ShareButtons';
import Billboard from '../../molecules/Billboard/Billboard';
import RelatedArticles from '../../molecules/RelatedArticles/RelatedArticles';
import Layout from '../Layout/Layout';
import './Article.scss';

export const Article = ({ data }) => {
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

  useEffect(() => setArticleProperties(articleReference.current), []);

  useScrollPosition(({ currentPosition }) => setScroll(currentPosition.y));

  return <Layout>
    <Seo title={article.frontmatter.content.title} />
    <Billboard {...article} author={author} tags={tags} />
    <section className={`wrapper article__wrapper`}>
      <ShareButtons shareParameters={shareParameters} tags={tags} scroll={scroll} />
      <article ref={articleReference} dangerouslySetInnerHTML={{ __html: article.html }} />
      <Author author={author} />
      <RelatedArticles relatedArticles={relatedArticles.edges}/>
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
                    isFeaturedPost
                    featuredImage {
                        childImageSharp {
                            fluid (maxWidth: 800) {
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
                        fluid(maxWidth: 800) {
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
                                    fluid(maxWidth: 800) {
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
