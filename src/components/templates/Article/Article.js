import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress';
import Navigation from '../../molecules/Navigation/Navigation';
import Billboard from '../../organisms/Billboard/Billboard';
import SEO from '../../organisms/SEO/SEO';
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
    <SEO title={article.frontmatter.title}/>
    <Billboard {...article} />
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
    }
`;

Article.propTypes = {
  data: PropTypes.object,
};

Navigation.defaultProps = {};

export default Article;
