import PropTypes from 'prop-types'
import { RangeSlider } from '../../molecules/RangeSlider/RangeSlider'
import RefinementsList from '../../molecules/RefinementsList/RefinementsList'
import { SortHitsBy } from '../../molecules/SortHitsBy/SortHitsBy'
import { Search } from '../Search/Search'
import './Filter.scss'
import React from 'react'

const Filter = ({
  filterParameters,
  defaultRefinement,
  hasRange,
  queryStringCriteria,
}) => {
  return (
    <aside className={`filters__wrapper`}>
      <Search/>
      <SortHitsBy
        defaultRefinement={defaultRefinement}
        items={filterParameters.SORT_BY}
      />
      {filterParameters.SEARCH_PARAMETERS.map((searchParameter) => {
        let matchCriteria
        if (queryStringCriteria) {
          matchCriteria = queryStringCriteria[searchParameter.queryString]
        }

        return (
          <RefinementsList
            key={searchParameter.label}
            queryStringCriteria={matchCriteria ? queryStringCriteria : null}
            {...searchParameter}
          />
        )
      })}
      {hasRange && <RangeSlider attribute="content.readingTime"/>}
    </aside>
  )
};

Filter.propTypes = {
  filterParameters: PropTypes.array.isRequired,
  defaultRefinement: PropTypes.string.isRequired,
  hasRange: PropTypes.bool.isRequired,
  queryStringCriteria: PropTypes.object,
};

Filter.defaultProps = {};

export default Filter;
