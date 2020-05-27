import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import './CityInformation.scss';

const CityInformation = ({ cityInformation }) => {
  const [isVisible, setIsVisible] = useState(false),
    handleModal = () => setIsVisible(!isVisible);

  useEffect(() => setIsVisible(true), [cityInformation]);

  return <div className={`city-information__wrapper`}>
    <article className={`city-information ${isVisible ? `--is-visible` : `--is-hidden`}`} dangerouslySetInnerHTML={{ __html: cityInformation }} />
    <span onClick={handleModal}>&times;</span>
  </div>;
};

CityInformation.propTypes = {
  cityInformation: PropTypes.string.isRequired,
};

CityInformation.defaultProps = {};

export default CityInformation;
