import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import '../../../styles/styles.scss';
import Footer from '../../atoms/Footer/Footer';
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

  return <section className={`site__wrapper`}>
    <Header />
    <main>{children}</main>
    <Footer />
  </section>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

Layout.defaultProps = {};

export default Layout;
