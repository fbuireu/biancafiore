import React from 'react';
import { CityCard } from '@components/molecules/cityCard';
import './cities.css';

interface CitiesData {
  cities: {
    name: string;
    period: string;
    image: string;
    description: string;
  }[];
}

export const Cities = ({ cities }: CitiesData) => {
  return (
    <ul className="city-card__list">
      {cities.map(({ name, period, description, image }, index) => {
        return (
          <CityCard key={name} index={index + 1} numCards={cities.length + 1}>
            <CityCard.Image src={image} alt={name} />
            <CityCard.Period>{period}</CityCard.Period>
            <CityCard.Title>{name}</CityCard.Title>
            <CityCard.Description>{description}</CityCard.Description>
          </CityCard>
        );
      })}
    </ul>
  );
};
