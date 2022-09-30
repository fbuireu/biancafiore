import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connectSortBy } from 'react-instantsearch-dom'
import Select from 'react-select'
import './SortHitsBy.scss'

const CustomSortHitsBy = ({ items, refine }) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption)
    refine(selectedOption.value)
  }

  return (
    <div className={`filter__sort-hits-by`}>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={items}
        isSearchable={false}
        placeholder={`Sort by...`}
      />
    </div>
  )
};

CustomSortHitsBy.propTypes = {
  items: PropTypes.string.isRequired,
  refine: PropTypes.string.isRequired,
};

CustomSortHitsBy.defaultProps = {};

export const SortHitsBy = connectSortBy(CustomSortHitsBy);
