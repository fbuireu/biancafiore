import { useEffect } from 'react';

export const useOutsideClick = (reference, callback) => {
    const handleClick = e => {
        if (reference.current && !reference.current.contains(e.target)) return callback();
    };

    useEffect(() => {
        document.addEventListener(`click`, handleClick);

        return () => document.removeEventListener(`click`, handleClick);

    });
};