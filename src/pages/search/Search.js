import React, { Component } from 'react';
import VerticalTabs from '../../components/PageTabs';
import SearchPeople from './SearchUsers';
import SearchGraphs from './SearchGraphs';
import ShareGraphs from './SearchSharedGraphs';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import SearchResult from './SearchResult';

class Search extends Component {
  render() {
    return (
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="searchPageTabs"
          direction="horizontal"
          tabs={[
            { to: '/search', name: 'Search', component: <SearchResult /> },
            { to: '/search-graph', name: 'Graphs', component: <SearchGraphs /> },
            { to: '/search-shared-graph', name: 'Shared SearchGraphs', component: <SearchPeople /> },
            { to: '/search-people', name: 'People', component: <ShareGraphs /> },
          ]}
        />
      </Wrapper>
    );
  }
}

export default Search;
