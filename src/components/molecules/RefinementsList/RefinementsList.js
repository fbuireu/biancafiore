import orderBy from 'lodash.orderby'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import ArrowDown from '../../../assets/svg-components/arrow-down.svg'
import { RefinementItem } from '../../atoms/RefinementItem/RefinementItem'
import './RefinementsList.scss'

const RefinementsList = ({ label, queryStringCriteria, ...props }) => {
  const [refinementSelected, setRefinementSelected] = useState(false)
  const defineRefinementListOrder = ({ items }) =>
    orderBy(items, [`label`, `count`], [`asc`, `desc`])

  const handleRefinementSelection = (value) => setRefinementSelected(value)

  return (
    <div className={`filter__refinement-list`}>
      <details
        className={`filter__refinement-details`}
        open={queryStringCriteria}
      >
        <summary className={`filter__refinement-summary`}>
          <span
            className={`filter__refinement-title ${
              refinementSelected ? `--is-selected` : ``
            }`}
          >
            {label}
          </span>
          <ArrowDown className={`arrow-down`}/>
        </summary>
        <RefinementItem
          transformItems={(items) => defineRefinementListOrder({ items })}
          selectRefinement={handleRefinementSelection}
          queryStringCriteria={queryStringCriteria}
          {...props}
        />
      </details>
    </div>
  )
};

RefinementsList.propTypes = {
  label: PropTypes.string.isRequired,
  attribute: PropTypes.string.isRequired,
  operator: PropTypes.string.isRequired,
  queryStringCriteria: PropTypes.string,
  queryString: PropTypes.string,
};

RefinementsList.defaultProps = {};

export default RefinementsList;
