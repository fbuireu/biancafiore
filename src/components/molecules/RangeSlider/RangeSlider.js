import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connectRange } from 'react-instantsearch-dom';
import Rheostat from 'rheostat';
import 'rheostat/css/rheostat.css';
import 'rheostat/initialize';

const CustomRangeSlider = ({ min, max, currentRefinement, canRefine, refine }) => {
  const [minState, setMinState] = useState(min);
  const [maxState, setMaxState] = useState(max);

  useEffect(function setMinAndMaxConstraints () {
    if (canRefine) {
      setMinState(currentRefinement.min);
      setMaxState(currentRefinement.max);
    }

  }, [currentRefinement.min, currentRefinement.max]);

  if (min === max) return null;

  const onChange = ({ values: [min, max] }) => {
    if (currentRefinement.min !== min || currentRefinement.max !== max) refine({ min, max });
  };

  const onValuesUpdated = ({ values: [min, max] }) => {
    setMinState(min);
    setMaxState(max);
  };

  return (
    <Rheostat min={min}
              max={max}
              values={[currentRefinement.min, currentRefinement.max]}
              onChange={onChange}
              onValuesUpdated={onValuesUpdated}>
      <div className="rheostat-marker rheostat-marker--large">
        <div className="rheostat-value">{minState}</div>
      </div>
      <div className="rheostat-marker rheostat-marker--large">
        <div className="rheostat-value">{maxState}</div>
      </div>
    </Rheostat>
  );
};

CustomRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  currentRefinement: PropTypes.shape.isRequired,
  canRefine: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired
};

export const RangeSlider = connectRange(CustomRangeSlider);