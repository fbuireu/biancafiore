import { graphql } from 'gatsby'
import PropTypes from 'prop-types'
import SEO from '../components/atoms/SEO/SEO'
import BlogJumbotron from '../components/molecules/BlogJumbotron/BlogJumbotron'
import AlgoliaWrapper
  from '../components/organisms/AlgoliaWrapper/AlgoliaWrapper'
import ArticleHitCards
  from '../components/organisms/ArticleHitCards/ArticleHitCards'
import Layout from '../components/templates/Layout/Layout'
import {
  ARTICLES_SEARCH_PARAMETERS,
} from '../utils/algolia/config/articlesSearchParameters'
import { ARTICLES_SORT_BY } from '../utils/algolia/config/articlesSortBy'
import React from 'react'

const FILTER_PARAMETERS = {
  SEARCH_PARAMETERS: ARTICLES_SEARCH_PARAMETERS,
  SORT_BY: ARTICLES_SORT_BY,
}

const Blog = ({
  location,
  data: {
    blog: {
      edges: [
        {
          node: { frontmatter: blog },
        },
      ],
    },
    latestFeaturedArticle: {
      edges: [{ node: latestFeaturedArticle }],
    },
  },
}) => {
  console.log(
    'process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME',
    process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME,
  )
  return (
    <Layout>
      <SEO title="Blog"/>
      <BlogJumbotron
        blog={blog}
        latestFeaturedArticle={latestFeaturedArticle}
        location={location}
      />
      <AlgoliaWrapper
        hitsComponent={ArticleHitCards}
        indexName={process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME}
        filterParameters={FILTER_PARAMETERS}
        hasRange={true}
      />
    </Layout>
  )
};

export const blogData = graphql`
    query getBlogData {
        blog: allMarkdownRemark(filter: { frontmatter: { key: { eq: "blog" } } }) {
            edges {
                node {
                    frontmatter {
                        title
                        jumbotron {
                            featuredArticle {
                                cta
                            }
                            socialNetworks {
                                cta
                                socialNetworks
                            }
                        }
                    }
                }
            }
        }
        latestFeaturedArticle: allMarkdownRemark(
            filter: {
                isFuture: { eq: false }
                frontmatter: {
                    key: { eq: "article" }
                    isDraft: { eq: false }
                    content: { isFeaturedArticle: { eq: true } }
                }
            }
            sort: { fields: frontmatter___content___publishDate, order: DESC }
            limit: 1
        ) {
            edges {
                node {
                    fields {
                        slug
                    }
                    frontmatter {
                        author
                        content {
                            title
                            tags
                            publishDate
                            readingTime
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
    }
`

Blog.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

Blog.defaultProps = {};

export default Blog;
