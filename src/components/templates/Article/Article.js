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

  useEffect(function setCurrentArticleProperties () {
    setArticleProperties(articleReference.current);
  }, []);

  useScrollPosition(function setScrollPosition ({ currentPosition }) {
    let { y: currentVerticalYPosition } = currentPosition;

    setScroll(currentVerticalYPosition);
  });

  return <Layout>
    <SEO title={title}/>
    <Billboard {...article} author={author} tags={tags}/>
    <section className={`wrapper article__wrapper`}>
      <ShareButtons shareParameters={shareParameters} tags={tags} scroll={scroll}/>
      <article ref={articleReference}>
        <Markdown>{html}</Markdown>
      </article>
      <Author author={author}/>
      <RelatedArticles relatedArticles={relatedArticles}/>
    </section>
    <ReadingProgress scroll={scroll} articleProperties={articleProperties}/>
  </Layout>;
};

export const articleData = graphql`query getArticleInformation($slug: String!, $author: String, $tags: [String!]) {
  article: markdownRemark(fields: { slug: { eq: $slug }}) {
    html
    excerpt(pruneLength: 350)
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
            gatsbyImageData(layout: FULL_WIDTH)
          }
        }
      }
    }
  }
  author: markdownRemark(frontmatter: { name: { eq: $author }}) {
    frontmatter {
      slug
      name
      description
      image {
        childImageSharp {
          gatsbyImageData(layout: FULL_WIDTH)
        }
      }
    }
  }
  relatedArticles: allMarkdownRemark(
    filter: {frontmatter: { content: { tags: { in: $tags }}}, fields: { slug: { ne: $slug }}}
    sort: { fields: frontmatter___content___publishDate, order: DESC }
    limit: 3
  ) {
    edges {
      node {
        excerpt(pruneLength: 350)
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
                gatsbyImageData(layout: FULL_WIDTH)
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
};

Article.defaultProps = {};

export default Article;