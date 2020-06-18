import orderBy from 'lodash.orderby';
import PropTypes from 'prop-types';
import React from 'react';
import { RefinementList } from 'react-instantsearch-dom';

const FilterRefinementList = ({ label, attribute, operator }) => {
  const defineRefinementListOrder = items => orderBy(items, [`label`, `count`], [`asc`, `desc`]);

  return <div className={`filter__refinement-list`}>
    <p>{label}</p>
    <RefinementList attribute={attribute} transformItems={items => defineRefinementListOrder(items)} operator={operator} />
  </div>;
};

FilterRefinementList.propTypes = {
  label: PropTypes.string.isRequired,
  attribute: PropTypes.string.isRequired,
  operator: PropTypes.string.isRequired,
};

FilterRefinementList.defaultProps = {};

export default FilterRefinementList;