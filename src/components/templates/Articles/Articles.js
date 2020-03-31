import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import Navigation from '../../molecules/Navigation/Navigation';
import Seo from '../../organisms/Seo';
import Layout from '../Layout/Layout';

const Articles = ({ data }) => {
  console.log(data);

  return <Layout>
    <Seo title="Home" />
    <h1>Hi people</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
  </Layout>;
};
export const articleData = graphql`
    query($slug: String!) {
        article:markdownRemark(fields: { slug: { eq: $slug }}) {
            html
            frontmatter {
                key
                language
                iso
                seo {
                    author
                    metaDescription
                }
                content {
                    publishDate
                    readingTime
                    title
                    tags
                    body
                }
            }
        }
    }
`;

Articles.propTypes = {
  data: PropTypes.object,
};

Navigation.defaultProps = {};

export default Articles;
