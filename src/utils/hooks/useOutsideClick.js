import { useEffect } from 'react'

export const useOutsideClick = (reference, callback) => {
  const handleClick = ({ target }) => {
    if (reference.current && !reference.current.contains(target))
      return callback()
  };

  useEffect(() => {
    document.addEventListener(`click`, handleClick);

    return () => document.removeEventListener(`click`, handleClick);
  });
};
