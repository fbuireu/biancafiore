import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import Header from '../../organisms/Header/Header';
import '../../../styles/styles.scss';

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
      query SiteTitleQuery {
          site {
              siteMetadata {
                  title
              }
          }
      }
  `);
  useScrollPosition(({ currentPosition }) => {});

  return (
    <>
      <Header siteTitle={`biancafiore.me (v0)`} />
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with love by
        {` `}
        <a href="https://www.gatsbyjs.org">Ferran Buireu</a>
      </footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
