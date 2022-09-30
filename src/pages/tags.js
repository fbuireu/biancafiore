import { graphql } from 'gatsby'
import PropTypes from 'prop-types'
import SEO from '../components/atoms/SEO/SEO'
import TagsJumbotron from '../components/molecules/TagsJumbotron/TagsJumbotron'
import TagsList from '../components/molecules/TagsList/TagsList'
import Layout from '../components/templates/Layout/Layout'
import React from 'react'

const Tags = ({
  location,
  data: {
    allTags: { edges: tags },
  },
}) => {
  tags = tags.flatMap(({ node: { frontmatter } }) => frontmatter).
    sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Layout>
      <SEO title="Tag"/>
      <section className={`wrapper tags__wrapper`}>
        <TagsJumbotron location={location}/>
        <TagsList tags={tags}/>
      </section>
    </Layout>
  )
}

export const tagsData = graphql`
    query getAllTags {
        allTags: allMarkdownRemark(
            filter: {
                frontmatter: { key: { in: ["articleTag", "projectTag", "tag"] } }
            }
        ) {
            edges {
                node {
                    frontmatter {
                        key
                        name
                        type
                    }
                }
            }
        }
    }
`;

Tags.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

Tags.defaultProps = {};

export default Tags;
