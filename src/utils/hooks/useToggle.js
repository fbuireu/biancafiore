import { useState } from 'react';

function useToggle(initialState = false) {
  const [state, setState] = useState(initialState);
  const handlers = {
    on: () => setState(true),
    off: () => setState(false),
    toggle: () => setState(scopeState => !scopeState),
    reset: () => setState(initialState)
  };

  return [state, handlers];
}

/*
  Usage:
 function Settings() {
 const [isExpanded, { toggle: toggleExpansion }] = useToggle(true)
 }
* */