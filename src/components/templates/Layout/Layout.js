import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import '../../../styles/styles.scss';
import Header from '../../organisms/Header/Header';

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
      query getSiteTitle {
          site {
              siteMetadata {
                  title
              }
          }
      }
  `);

  return  <section className={`site__wrapper`}>
    <Header siteTitle={`biancafiore.me (v0)`} />
    <main>{children}</main>
    <footer>
      © {new Date().getFullYear()}, Built by
      {` `}
      <a href="https://www.gatsbyjs.org">Ferran Buireu</a>
    </footer>
  </section>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

Layout.defaultProps = {};

export default Layout;
