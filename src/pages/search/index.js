import React from 'react';
import Graphs from './_partials/Graphs';
import Users from './_partials/Users';
import SharedGraphs from './_partials/SharedGraphs';
import SearchTemplate from './SearchTemplate';

const Search = React.memo(() => (
  <SearchTemplate>
    <Graphs setLimit />
    <SharedGraphs setLimit />
    <Users setLimit />
  </SearchTemplate>
));

export default Search;
