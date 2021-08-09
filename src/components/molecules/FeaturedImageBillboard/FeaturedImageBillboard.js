import BackgroundImage from 'gatsby-background-image';
import PropTypes from 'prop-types';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Summary from '../../atoms/Summary/Summary';
import Tag from '../../atoms/Tag/Tag';
import Title from '../../atoms/Title/Title';
import './FeaturedImageBillboard.scss';

const FeaturedImageBillboard = ({ frontmatter, author, tags, excerpt }) => {
  let summary = frontmatter.content.summary ?? excerpt;

  return (
    <BackgroundImage className={`billboard`}
                     Tag={`section`}
                     fluid={[`linear-gradient(to bottom, transparent, #000)`, frontmatter?.content?.featuredImage?.childImageSharp?.fluid]}>
      <div className={`wrapper article__information__wrapper`}>
        <header className={`article__information`}>
          <Title title={frontmatter.content.title} />
          <Subtitle author={author.frontmatter.name} lastUpdated={frontmatter.content.lastUpdated} />
          <Summary summary={summary} classNames={`hit-card__summary`} />
          <ReadingTime readingTime={frontmatter.content.readingTime} classNames={`article__reading-time`} />
          <Tag tags={tags} />
        </header>
      </div>
    </BackgroundImage>
  );
};

FeaturedImageBillboard.propTypes = {
  frontmatter: PropTypes.object.isRequired,
  author: PropTypes.objectOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  excerpt: PropTypes.string,
};

FeaturedImageBillboard.defaultProps = {};

export default FeaturedImageBillboard;