import React from 'react';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageContainer from '../../components/PageContainer';

const SearchTemplate = React.memo(({ children }) => {
  const { s: searchParam } = queryString.parse(window.location.search);

  return (
    <PageContainer>
      <div className="searchData">
        <div className="searchData__links">
          <div className="searchData__link"><Link to={`search-graph?s=${searchParam}`}>Graphs</Link></div>
          <div className="searchData__link"><Link to={`search-shared-graph?s=${searchParam}`}>Shared Graphs</Link></div>
          <div className="searchData__link">
            <Link to={`search-people?s=${searchParam}`} style={{ marginRight: '32px' }}>People</Link>
          </div>
        </div>
        { children }
      </div>
    </PageContainer>
  );
});

SearchTemplate.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SearchTemplate;
