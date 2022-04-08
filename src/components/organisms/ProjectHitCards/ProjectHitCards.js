import { connectStateResults } from 'react-instantsearch-dom';
import { ProjectHitCard } from '../ProjectHitCard/ProjectHitCard';
import './ProjectHitCards.scss';

const ProjectHitCards = () => {
  const FilterResults = connectStateResults(
    ({ searchResults, children }) => searchResults && searchResults.nbHits !== 0
      ? children
      : <p className={`filter__results --no-results-found`}>{`Blimey! You're so picky that not even a genie could find what you're looking for. Try to expand your search.`}</p>,
  );

  return <div className={`filter__results`}>
    <FilterResults>
      <ProjectHitCard />
    </FilterResults>
  </div>;
};

ProjectHitCards.propTypes = {};

ProjectHitCards.defaultProps = {};

export default ProjectHitCards;