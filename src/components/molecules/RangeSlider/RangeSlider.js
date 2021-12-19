import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { connectRange } from 'react-instantsearch-dom';
import Rheostat from 'rheostat';
import 'rheostat/css/rheostat.css';
import 'rheostat/initialize';
import './RangeSlider.scss';

const CustomRangeSlider = ({ min, max, currentRefinement, canRefine, refine }) => {
  const getMin= min => min;
  const getMax= max => max;

  const [minState, setMinState] = useState(getMin);
  const [maxState, setMaxState] = useState(getMax);

  useEffect(function setMinAndMaxConstraints () {
    if (canRefine) {
      setMinState(currentRefinement.min);
      setMaxState(currentRefinement.max);
    }

  }, [currentRefinement.min, currentRefinement.max, canRefine]);

  if (min === max) return null;

  const onChange = ({ values: [min, max] }) => {
    if (currentRefinement.min !== min || currentRefinement.max !== max) refine({ min, max });
  };

  const onValuesUpdated = ({ values: [min, max] }) => {
    setMinState(min);
    setMaxState(max);
  };

  return <div className={`filter__refinement-range-list`}>
    <span className={`filter__refinement-range-title`}>Reading time</span>
    <Rheostat min={min}
              max={max}
              values={[currentRefinement.min, currentRefinement.max]}
              onChange={onChange}
              onValuesUpdated={onValuesUpdated}>
      <div className="range-list__marker range-list__marker__min">
        <div className="rheostat-value">{minState}min</div>
      </div>
      <div className="range-list__marker range-list__marker--large__max">
        <div className="rheostat-value">{maxState}min</div>
      </div>
    </Rheostat>
  </div>;
};

CustomRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  currentRefinement: PropTypes.shape.isRequired,
  canRefine: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired
};

export const RangeSlider = connectRange(CustomRangeSlider);