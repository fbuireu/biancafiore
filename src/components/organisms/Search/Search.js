import algoliasearch from 'algoliasearch/lite';
import { Link } from 'gatsby';
import React from 'react';
import { connectHits, Highlight, InstantSearch, SearchBox } from 'react-instantsearch-dom';

const searchClient = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID,
  process.env.GATSBY_ALGOLIA_SEARCH_KEY,
);

const Hits = connectHits(({ hits }) => (
  <div css={{ display: `flex`, flexWrap: `wrap` }}>
    {hits.length ? <React.Fragment>
      <div css={{
        fontSize: `.85rem`,
        fontStyle: `italic`,
        maxWidth: `30rem`,
      }}>
        These are the results of your search. The title and excerpt are
        displayed, though your search may have been found in the content of
        the post as well.
      </div>
      {hits.map(hit => {
        return <div key={hit.objectID}>
          <Link css={{ display: `block` }}
                to={hit.slug}>
            <h4 css={{ marginBottom: 0 }}>
              <Highlight attribute="title" hit={hit} tagName="strong" />
            </h4>
            {hit.subtitle && <h5 css={{ marginBottom: 0 }}>
              <Highlight attribute="subtitle"
                         hit={hit}
                         tagName="strong" />
            </h5>
            }
          </Link>
          <div><Highlight attribute="excerpt" hit={hit} tagName="strong" /></div>
        </div>;
      })}
    </React.Fragment>
    : <p>There were no results for your query. Please try again.</p>
    }
  </div>
));

export default function Search() {
  return (
    <InstantSearch
      indexName={process.env.GATSBY_ALGOLIA_INDEX_NAME}
      searchClient={searchClient}>
      <SearchBox />
      <Hits />
    </InstantSearch>
  );
}