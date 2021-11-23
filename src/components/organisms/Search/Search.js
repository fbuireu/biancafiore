import PropTypes from 'prop-types';
import { connectSearchBox } from 'react-instantsearch-dom';
import Close from '../../../assets/svg-components/close.svg';
import Lens from '../../../assets/svg-components/lens.svg';
import SearchStats from '../../molecules/SearchStats/SearchStats';
import './Search.scss';

const CustomSearch = ({ currentRefinement, refine }) => {
  const resetQuery = event => {
    event.preventDefault();
    refine(``);
  };

  const searchQuery = ({ event: { currentTarget: { value } } }) => refine(value);

  return <div className={`filter__search`}>
    <form noValidate action={``} role={`search`}>
      <div className={`filter__search__inner`}>
        <input id={`filter__search__input`}
               className={`filter__search__input ${currentRefinement.length ? `--has-value` : ``}`}
               type={`search`}
               value={currentRefinement}
               onChange={searchQuery} />
        <label htmlFor={`filter__search__input`}
               className={`filter__search__label`}>Find anything but Nemo</label>
        <div className={`filter__search__input__border`} />
        <div className={`filter__search__buttons`}>
          {currentRefinement.length ? <Close className={`filter__search__buttons__reset-query`} onClick={resetQuery} /> : <Lens />}
        </div>
      </div>
      <SearchStats />
    </form>
  </div>;
};

CustomSearch.propTypes = {
  currentRefinement: PropTypes.string.isRequired,
  refine: PropTypes.string.isRequired,
};

CustomSearch.defaultProps = {};

export const Search = connectSearchBox(CustomSearch);

