import PropTypes from 'prop-types';
import React from 'react';
import FeaturedImageHit from '../../organisms/FeaturedImageHit/FeaturedImageHit';
import SimpleHit from '../../organisms/SimpleHit/SimpleHit';
import './Hit.scss';

const Hit = ({ hit: article }) => article.content.featuredImage ? <FeaturedImageHit {...article} /> : <SimpleHit {...article} />;

Hit.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object),
};

Hit.defaultProps = {};

export default Hit;