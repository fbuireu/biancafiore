import PropTypes from 'prop-types';
import React from 'react';
import FeaturedImageBillboard from '../../molecules/FeaturedImageBillboard/FeaturedImageBillboard';
import SimpleBillboard from '../../molecules/SimpleBillboard/SimpleBillboard';
import './Billboard.scss';

const Billboard = props => props.frontmatter.content.featuredImage ? <FeaturedImageBillboard {...props} /> : <SimpleBillboard {...props} />;

Billboard.propTypes = {
  frontmatter: PropTypes.object.isRequired,
};

Billboard.defaultProps = {};

export default Billboard;