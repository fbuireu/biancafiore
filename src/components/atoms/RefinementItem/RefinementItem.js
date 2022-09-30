import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connectRefinementList } from 'react-instantsearch-dom'
import './RefinementItem.scss'

const CustomRefinementItem = ({
  items,
  refine,
  selectRefinement,
  queryStringCriteria,
  queryString,
}) => {
  const [activeRefinements, setActiveRefinements] = useState([])
  let isRefinementSelected = false

  useEffect(() => {
    if (queryStringCriteria) {
      refine(queryStringCriteria[queryString])
      selectRefinement(true)
    }
  }, [refine, queryStringCriteria, selectRefinement])

  const handleClick = ({ event, value: { value }, index }) => {
    event.preventDefault()
    let isSelectingMoreRefinements = !activeRefinements.includes(index);

    if (isSelectingMoreRefinements) {
      setActiveRefinements((isActiveRefinement) => [
        ...isActiveRefinement,
        index,
      ])
      isRefinementSelected = true
    } else {
      setActiveRefinements(activeRefinements.filter((item) => item !== index))
      isRefinementSelected = activeRefinements.length - 1 !== 0
    }

    selectRefinement(isRefinementSelected)
    refine(value)
  };

  return (
    <div className={`refinement-list__wrapper`}>
      <ul className={`refinement-list__list`}>
        {items.map((item, index) => {
          return (
            <li
              key={item.label}
              className={`refinement-list__item ${
                activeRefinements.includes(index) ? `--is-selected` : ``
              } ${
                item.label ===
                (queryStringCriteria && queryStringCriteria[queryString])
                  ? `--is-locked`
                  : ``
              }`}
              onClick={(event) =>
                handleClick({ event: event, value: item, index: index })
              }
            >
              <label className={`refinement-list__item__label`}>
                <input
                  className={`refinement-list__item__checkbox`}
                  type={`checkbox`}
                />
                <span className={`refinement-list__item__label-text`}>
                  {item.label} <sub>({item.count})</sub>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
};

CustomRefinementItem.propTypes = {
  items: PropTypes.string.isRequired,
  refine: PropTypes.string.isRequired,
  selectRefinement: PropTypes.string.isRequired,
  attribute: PropTypes.string,
  queryStringCriteria: PropTypes.string,
  queryString: PropTypes.string,
};

CustomRefinementItem.defaultProps = {};

export const RefinementItem = connectRefinementList(CustomRefinementItem);
