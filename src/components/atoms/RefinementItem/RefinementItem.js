import PropTypes from 'prop-types';
import { useState } from 'react';
import { connectRefinementList } from 'react-instantsearch-dom';
import './RefinementItem.scss';

const CustomRefinementItem = ({ items, refine, selectRefinement }) => {
  const [isActiveRefinement, setIsActiveRefinements] = useState([]);
  let isRefinementSelected = false;

  const handleClick = ({ event, value: { value }, index }) => {
    event.preventDefault();

    let isSelectingMoreRefinements = !isActiveRefinement.includes(index);

    if (isSelectingMoreRefinements) {
      setIsActiveRefinements(isActiveRefinement => [...isActiveRefinement, index]);
      isRefinementSelected = true;
    } else {
      setIsActiveRefinements(isActiveRefinement.filter(item => item !== index));
      isRefinementSelected = isActiveRefinement.length - 1 !== 0;
    }

    selectRefinement(isRefinementSelected);
    refine(value);
  };

  return <div className={`refinement-list__wrapper`}>
    <ul className={`refinement-list__list`}>
      {items.map((item, index) => (
        <li key={item.label}
            className={`refinement-list__item ${isActiveRefinement.includes(index) ? `--is-selected` : ``}`}
            onClick={event => handleClick({ event: event, value: item, index: index })}>
          <label className={`refinement-list__item__label`}>
            <input className={`refinement-list__item__checkbox`} type={`checkbox`} />
            <span className={`refinement-list__item__label-text`}>{item.label} <sub>({item.count})</sub></span>
          </label>
        </li>
      ))}
    </ul>
  </div>;
};

CustomRefinementItem.propTypes = {
  items: PropTypes.string.isRequired,
  refine: PropTypes.string.isRequired,
  selectRefinement: PropTypes.string.isRequired,
};

CustomRefinementItem.defaultProps = {};

export const RefinementItem = connectRefinementList(CustomRefinementItem);