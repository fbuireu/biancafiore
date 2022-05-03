import { useReducer } from 'react';

function _toggle(currentValue, newValue) {
  return typeof newValue === `boolean` ? newValue : !currentValue;
}

function useToggle(initialValue = false) {
  return useReducer(_toggle, initialValue);
}

export default useToggle;