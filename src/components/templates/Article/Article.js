import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import Navigation from '../../molecules/Navigation/Navigation';
import Seo from '../../organisms/Seo';
import Layout from '../Layout/Layout';
import './Article.scss';

const Article = ({ data }) => {
  const [scroll, setScroll] = useState(0),
    [articleProperties, setArticleProperties] = useState({}),
    articleReference = useRef(null),
    { article } = data;

  useEffect(() => setArticleProperties(articleReference.current), []);

  useScrollPosition(({ currentPosition }) => setScroll(currentPosition.y));

  return <Layout>
    <Seo title="Home" />
    <h1>{article.frontmatter.content.title}</h1>
    <ReadingProgress scroll={scroll} articleProperties={articleProperties} />
    <article ref={articleReference} dangerouslySetInnerHTML={{ __html: article.html }} />
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
                    publishDate
                    lastUpdated
                    readingTime
                    isFeaturedPost
                    featuredImage
                    title
                    tags
                }
            }
        }
    }
`;

Article.propTypes = {
  data: PropTypes.object,
};

Navigation.defaultProps = {};

export default Article;
