import Img from 'gatsby-image';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs';
import './ContactJumbotron.scss';

const ContactJumbotron = ({ jumbotron:{welcomeText, welcomeDescription, image}, location }) => {
  console.log("location", location);
  return <section className={`contact__jumbotron__wrapper wrapper`}>
    <Breadcrumbs classNames={`contact__jumbotron`} location={location} />
    <h1 className={`contact__jumbotron__title`}>{welcomeText}</h1>
    <Markdown className={`contact__jumbotron__description`}>{welcomeDescription}</Markdown>
    <Img className={`contact__jumbotron__image`} fixed={image?.childImageSharp?.fixed} />
  </section>
}; 

ContactJumbotron.propTypes = {
  jumbotron: PropTypes.arrayOf(String).isRequired,
  location: PropTypes.arrayOf(String)
};

ContactJumbotron.defaultProps = {};

export default ContactJumbotron;
