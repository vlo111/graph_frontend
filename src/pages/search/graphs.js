import React from 'react';
import SearchTemplate from './SearchTemplate';
import GraphsData from './_partials/Graphs';

const Graphs = React.memo(() => (
  <SearchTemplate>
    <GraphsData />
  </SearchTemplate>
));

export default Graphs;
