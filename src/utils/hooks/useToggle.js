import { useReducer } from 'react';

function _toggler(currentValue, newValue) {
  return typeof newValue === `boolean` ? newValue : !currentValue;
}

function useToggle(initialValue = false) {
  return useReducer(_toggler, initialValue);
}

export default useToggle;