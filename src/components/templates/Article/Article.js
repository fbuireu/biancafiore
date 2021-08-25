import { graphql } from 'gatsby';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../utils/hooks/useScrollPosition';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import SEO from '../../atoms/SEO/SEO';
import RelatedArticles from '../../molecules/RelatedArticles/RelatedArticles';
import Billboard from '../../organisms/Billboard/Billboard';
import Layout from '../Layout/Layout';
import './Article.scss';

const Article = ({ data, location }) => {
  const [scroll, setScroll] = useState(0);
  const [articleProperties, setArticleProperties] = useState({});
  const articleReference = useRef(null);
  const { article } = data;
  const {
    article: { html, excerpt, fields: { slug }, frontmatter: { content: { title, summary, tags } } },
    author,
    relatedArticles: { edges: relatedArticles },
    site: { siteMetadata: { author: metaAuthor, url } }
  } = data;

  const shareParameters = {
    author: metaAuthor,
    parameters: {
      domain: url,
      url: `${url}${slug}`,
      title: title,
      description: summary ?? excerpt
    }
  };

  useEffect(function setCurrentArticleProperties() {
    setArticleProperties(articleReference.current);
  }, []);

  useScrollPosition(function setScrollPosition({ currentPosition }) {
    let { y: currentVerticalYPosition } = currentPosition;

    setScroll(currentVerticalYPosition);
  });

  return <Layout location={location}>
    <SEO title={title} />
    <Billboard author={author} tags={tags} location={location} shareParameters={shareParameters} {...article} />
    <section className={`wrapper article__wrapper`}>
      <article ref={articleReference}>
        <Markdown>{html}</Markdown>
      </article>
      <RelatedArticles relatedArticles={relatedArticles} />
    </section>
    <ReadingProgress scroll={scroll} articleProperties={articleProperties} />
  </Layout>;
};

export const articleData = graphql`
    query getArticleInformation ($slug: String!, $author: String, $tags: [String!]) {
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
                    tags
                    featuredImage {
                        childImageSharp {
                            fluid {
                                ...GatsbyImageSharpFluid
                            }
                        }
                    }
                }
            }
        }
        author: markdownRemark (frontmatter: { name: { eq: $author }}) {
            frontmatter {
                slug
                name
                description
                image {
                    childImageSharp {
                        fluid {
                            ...GatsbyImageSharpFluid
                        }
                    }
                }
            }
        }
        relatedArticles: allMarkdownRemark (
            filter: {
                frontmatter: { content: { tags: { in: $tags }}},
                fields: { slug: { ne: $slug }
                }
            },
            sort: {
                fields: frontmatter___content___publishDate,
                order: DESC
            },
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
                            tags
                            featuredImage {
                                childImageSharp {
                                    fluid {
                                        ...GatsbyImageSharpFluid
                                    }
                                }
                            }
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
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

Article.defaultProps = {};

export default Article;