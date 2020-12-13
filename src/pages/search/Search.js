import React, { Component } from 'react';
import VerticalTabs from '../../components/PageTabs';
import SearchPeople from './SearchUsers';
import SearchGraphs from './SearchGraphs';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import SearchResult from './SearchResult';
import SearchSharedGraphs from './SearchSharedGraphs';

class Search extends Component {
  handleRouteChange = (tab) => {
    this.props.history.push(tab.to + window.location.search)
  }

  render() {
    return (
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="searchPageTabs"
          direction="horizontal"
          onChange={this.handleRouteChange}
          tabs={[
            { to: '/search', name: 'Search', component: <SearchResult /> },
            { to: '/search-graph', name: 'Graphs', component: <SearchGraphs /> },
            { to: '/search-shared-graph', name: 'Shared Graphs', component: <SearchSharedGraphs /> },
            { to: '/search-people', name: 'People', component: <SearchPeople /> },
          ]}
        />
      </Wrapper>
    );
  }
}

export default Search;
