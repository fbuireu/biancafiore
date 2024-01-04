import React, { type ReactNode } from 'react';
import './city-period.css';

export interface CityPeriodProps {
    children: ReactNode;
}

export const CityPeriod = ({ children }: CityPeriodProps) => (
    <h4 className="city-card__content__period font-serif">{children}</h4>
);
