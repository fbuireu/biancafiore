import orderBy from 'lodash.orderby';
import PropTypes from 'prop-types';
import React from 'react';
import { RefinementList } from 'react-instantsearch-dom';
import ArrowDown from '../../../assets/svg/arrow-down.svg';
import './FilterRefinementList.scss';

const FilterRefinementList = ({ label, attribute, operator }) => {
  const defineRefinementListOrder = items => orderBy(items, [`label`, `count`], [`asc`, `desc`]);

  return <div className={`filter__refinement-list`}>
    <details className={`filter__refinement-details`}>
      <summary className={`filter__refinement-summary`}>
        <span>{label}</span>
        <ArrowDown className={`arrow-down`} />
      </summary>
      <RefinementList attribute={attribute} transformItems={items => defineRefinementListOrder(items)} operator={operator} />
    </details>
  </div>;
};

FilterRefinementList.propTypes = {
  label: PropTypes.string.isRequired,
  attribute: PropTypes.string.isRequired,
  operator: PropTypes.string.isRequired,
};

FilterRefinementList.defaultProps = {};

export default FilterRefinementList;