import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { Highlight } from 'react-instantsearch-dom';
import Label from '../../../assets/svg-components/label.svg';
import slugify from '../../../utils/slugify/slugify';
import './HitTags.scss';

const HitTags = ({ hit, attribute }) => {
  const { locale: currentLanguage } = useIntl();

  return <ul className={`hit-card__tags__list`}>
    {hit.content
      ? hit.content.tags.map((tag, index) => <li className={`hit-card__tag__item`} key={tag}>
        <Link to={`/${currentLanguage}/tag/${slugify(tag)}`}
              className={`hit-card__tag__item__link`}>
          <Label className={`hit-card__tag__item__label`} />
          <Highlight attribute={`${attribute}[${index}]`} hit={hit} tagName={`mark`} />
        </Link>
      </li>
      )
      : hit.tags.map((tag, index) => <li className={`hit-card__tag__item`} key={tag}>
        <Link to={`/${currentLanguage}/tag/${slugify(tag)}`}
              className={`hit-card__tag__item__link`}>
          <Label className={`hit-card__tag__item__label`} />
          <Highlight attribute={`${attribute}[${index}]`} hit={hit} tagName={`mark`} />
        </Link>
      </li>
      )
    }
  </ul>;
};

HitTags.propTypes = {
  hit: PropTypes.arrayOf(PropTypes.string).isRequired,
  attribute: PropTypes.string
};

HitTags.defaultProps = {};

export default HitTags;