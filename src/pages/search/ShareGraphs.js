import React from 'react';
import SearchTemplate from './SearchTemplate';
import SharedGraphs from './_partials/SharedGraphs';

const ShareGraphs = React.memo(() => (
  <SearchTemplate>
    <SharedGraphs />
  </SearchTemplate>
));

export default ShareGraphs;
