import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import './CityInformation.scss';

const CityInformation = ({ cityInformation }) => {
  const [isVisible, setIsVisible] = useState(false);

  const closeModal = () => setIsVisible(false);

  useEffect(function changeSelectedCity() {
    setIsVisible(true);
  }, [cityInformation]);

  return <div className={`city-information__modal__wrapper ${isVisible ? `--is-visible` : `--is-hidden`}`}>
    <div className={`city-information__modal__inner`}>
      <article className={`city-information`}>
        <Markdown>{cityInformation}</Markdown>
      </article>
      <span className={`city-information__modal__close`} onClick={closeModal}>&times;</span>
    </div>
  </div>;
};

CityInformation.propTypes = {
  cityInformation: PropTypes.string.isRequired,
};

CityInformation.defaultProps = {};

export default CityInformation;
