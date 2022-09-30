import { graphql, useStaticQuery } from 'gatsby'
import PropTypes from 'prop-types'
import '../../../styles/styles.scss'
import Footer from '../../atoms/Footer/Footer'
import Header from '../../organisms/Header/Header'
import React from 'react'

const BLOG_PATH = `/blog`

const Layout = ({ children, location = {} }) => {
  const data = useStaticQuery(graphql`
      query getSiteTitle {
          site {
              siteMetadata {
                  title
              }
          }
      }
  `);

  const isArticle = location?.href?.includes(BLOG_PATH);

  return <section className={`site__wrapper`}>
    <Header />
    <main className={`${isArticle ? `--is-article` : ``}`}>
      {children}
    </main>
    <Footer />
  </section>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.node.isRequired
};

Layout.defaultProps = {};

export default Layout;
