import React, { Component } from 'react';
import SearchGraphs from './SearchGraphs';
import SearchSharedGraphs from './SearchSharedGraphs';
import SearchUsers from './SearchUsers';

class SearchResult extends Component {
  render() {
    return (
      <>
        <SearchGraphs setLimit />
        <SearchSharedGraphs setLimit />
        <SearchUsers setLimit />
      </>
    );
  }
}

export default SearchResult;
