import React from 'react';
import { mailTo } from '@shared/utils/mailTo';

interface EmailButtonProps {
  classNames?: string;
}

export const EmailButton = ({ classNames }: EmailButtonProps) => {
  return (
    <button onClick={mailTo} className={`${classNames} link mailTo__button`}>
      Email
    </button>
  );
};
