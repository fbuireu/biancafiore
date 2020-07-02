import React from 'react';
import { SortBy } from 'react-instantsearch-dom';
import './SortHitsBy.scss';

const SortHitsBy = () => <SortBy defaultRefinement={process.env.GATSBY_ALGOLIA_INDEX_NAME}
                                 items={[
                                   { value: `content.readingTime_asc`, label: `Reading Time (asc)` },
                                   { value: `content.readingTime_desc`, label: `Reading Time (desc)` },
                                   { value: `content.isFeaturedArticle`, label: `Featured` },
                                 ]} />;

export default SortHitsBy;

SortHitsBy.propTypes = {};

SortHitsBy.defaultProps = {};
