import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { connectRefinementList } from 'react-instantsearch-dom';
import './RefinementList.scss';

const CustomRefinementList = ({ items, refine, selectRefinement }) => {
  const [isActiveRefinement, setIsActiveRefinements] = useState([]),
    [isRefinementSelected, setIsRefinementSelected] = useState(true),
    refinementReference = useRef(null);
  const handleClick = (event, { value }, index) => {
    event.preventDefault();
    refine(value);
    setIsRefinementSelected(!isRefinementSelected);
    selectRefinement(isRefinementSelected);

    if (!isActiveRefinement.includes(index)) setIsActiveRefinements(previousState => [...previousState, index]);
    else setIsActiveRefinements(isActiveRefinement.filter(item => (item !== index)));
  };
  return <div className={`refinement-list__wrapper`}>
    <ul className={`refinement-list__list`}>
      {items.map((item, index) => {
        return <li key={item.label}
                   className={`refinement-list__item ${isActiveRefinement.includes(index) ? `--is-selected` : ``}`}
                   ref={refinementReference}
                   onClick={event => handleClick(event, item, index)}>
          <label className={`refinement-list__item__label`}>
            <input className={`refinement-list__item__checkbox`} type={`checkbox`} />
            <span className={`refinement-list__item__label-text`}>{item.label}</span>
            <span className={`refinement-list__item__count`}>{item.count}</span>
          </label>
        </li>;
      })}
    </ul>
  </div>;
};

CustomRefinementList.propTypes = {
  items: PropTypes.string.isRequired,
  refine: PropTypes.string.isRequired,
  selectRefinement: PropTypes.string.isRequired,
};

CustomRefinementList.defaultProps = {};

export const RefinementList = connectRefinementList(CustomRefinementList);