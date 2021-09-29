import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VerticalTabs from '../../components/PageTabs';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import ScrollButton from '../../components/ScrollButton';
import SearchResult from './SearchResult';
import SearchSharedGraphs from './SearchSharedGraphs';
import SearchPeople from './SearchUsers';
import SearchGraphs from './SearchGraphs';
import SearchPictures from './SearchPictures';
import SearchDocuments from './SearchDocuments';

class Search extends Component {
  static propTypes = {
    history: PropTypes.string.isRequired,
  };

  handleRouteChange = (tab) => {
    this.props.history.push(tab.to + window.location.search);
  }

  render() {
    return (
      <>
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
              { to: '/search-pictures', name: 'Pictures', component: <SearchPictures /> },
              { to: '/search-documents', name: 'Documents', component: <SearchDocuments /> },
            ]}
          />
          <ScrollButton />
        </Wrapper>
      </>
    );
  }
}

export default Search;
