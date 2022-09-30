import { graphql, useStaticQuery } from 'gatsby'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import React from 'react'

const SEO = ({ description, lang, meta, title }) => {
  const { site } = useStaticQuery(graphql`
              query getAllMetadata {
                  site {
                      siteMetadata {
                          title
                          description
                          author
                      }
                  }
              }
    `,
  );
  const metaDescription = description ?? site.siteMetadata.description;

  return <Helmet htmlAttributes={{ lang }} title={title} titleTemplate={`%s | ${site.siteMetadata.title}`}>
    <meta name={`robots`} content={`noindex, nofollow`}/>
    <meta name={`description`} content={metaDescription}/>
    <meta name={`og:title`} content={title}/>
    <meta name={`og:description`} content={metaDescription}/>
    <meta name={`og:type`} content={`website`}/>
    <meta name={`twitter:card`} content={`summary`}/>
    <meta name={`twitter:creator`} content={site.siteMetadata.author}/>
    <meta name={`twitter:title`} content={title}/>
    <meta name={`twitter:description`} content={metaDescription}/>
  </Helmet>;
};

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

SEO.propTypes = {
  description: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  meta: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
};

export default SEO;
