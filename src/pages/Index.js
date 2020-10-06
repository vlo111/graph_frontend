import React, { Component } from 'react';
import queryString from 'query-string';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';

import GraphTemplates from './profile/GraphTemplates';
import Shared from './Shared';
import Home from './Home';
import VerticalTabs from '../components/VerticalTabs';

class Index extends Component {
  handleChange = () => {
    const queryObj = queryString.parse(window.location.search);
    delete queryObj.page;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  render() {
    return (
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="homePageTabs"
          tabs={['Home', 'Templates', 'Shared Graphs']}
          onChange={this.handleChange}
        >
          <Home />
          <GraphTemplates />
          <Shared />
        </VerticalTabs>
      </Wrapper>
    );
  }
}

export default Index;
