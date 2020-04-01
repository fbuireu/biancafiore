import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import Navigation from '../../molecules/Navigation/Navigation';
import Seo from '../../organisms/Seo';
import Layout from '../Layout/Layout';

const Article = ({ data }) => {
  const { article } = data;

  return <Layout>
    <Seo title="Home" />
    <h1>{article.frontmatter.content.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: article.frontmatter.content.body }} />
  </Layout>;
};

// export const articleData = graphql`
//     query ($slug: String!) {
//         article:markdownRemark(fields: { slug: { eq: $slug }}) {
//             html
//             frontmatter {
//                 key
//                 language
//                 iso
//                 seo {
//                     author
//                     metaDescription
//                 }
//                 content {
//                     publishDate
//                     title
//                     tags
//                     body
//                 }
//             }
//         }
//     }
// `;

Article.propTypes = {
  data: PropTypes.object,
};

Navigation.defaultProps = {};

export default Article;
