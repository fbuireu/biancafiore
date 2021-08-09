import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import Label from '../../../assets/svg-components/label.svg';
import slugify from '../../../utils/slugify/slugify';
import './Tag.scss';

const Tag = ({ tags }) => {
  const { locale: currentLanguage } = useIntl();
  
  return <ul className={`article__tags__list`}>
    {tags.map(tag => (
      <li className={`article__tag__item`} key={tag}>
        <Link to={`/${currentLanguage}/tag/${slugify(tag)}`}
              className={`article__tag__item__link`}>
          <Label className={`article__tag__item__label`}/>
          {tag}
        </Link>
      </li>
    ))}
  </ul>;
};

Tag.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
};

Tag.defaultProps = {};

export default Tag;