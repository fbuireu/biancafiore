import orderBy from 'lodash.orderby';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ArrowDown from '../../../assets/svg/arrow-down.svg';
import { RefinementItem } from '../../atoms/RefinementItem/RefinementItem';
import './RefinementsList.scss';

const RefinementsList = ({ label, attribute, operator }) => {
  const [refinementSelected, setRefinementSelected] = useState(false);

  const defineRefinementListOrder = items => orderBy(items, [`label`, `count`], [`asc`, `desc`]);

  const handleRefinementSelection = value => setRefinementSelected(value);

  return <div className={`filter__refinement-list`}>
    <details className={`filter__refinement-details`}>
      <summary className={`filter__refinement-summary`}>
        <span className={`filter__refinement-title ${refinementSelected ? `--is-selected` : ``}`}>{label}</span>
        <ArrowDown className={`arrow-down`} />
      </summary>
      <RefinementItem attribute={attribute}
                      operator={operator}
                      transformItems={items => defineRefinementListOrder(items)}
                      selectRefinement={handleRefinementSelection} />
    </details>
  </div>;
};

RefinementsList.propTypes = {
  label: PropTypes.string.isRequired,
  attribute: PropTypes.string.isRequired,
  operator: PropTypes.string.isRequired,
};

RefinementsList.defaultProps = {};

export default RefinementsList;