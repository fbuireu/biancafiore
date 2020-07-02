import React from 'react';
import { Stats } from 'react-instantsearch-dom';
import './Filterstats.scss';

const FilterStats = () => <div className={`filter__stats`}><Stats /></div>;

FilterStats.propTypes = {};

FilterStats.defaultProps = {};

export default FilterStats;
