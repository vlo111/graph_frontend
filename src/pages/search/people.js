import React from 'react';
import SearchTemplate from './SearchTemplate';
import Users from './_partials/Users';

const People = React.memo(() => (
  <SearchTemplate>
    <Users />
  </SearchTemplate>
));

export default People;
