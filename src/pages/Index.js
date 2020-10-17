import React, { Component } from 'react';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';

import GraphTemplates from './profile/GraphTemplates';
import Shared from './Shared';
import Home from './Home';
import VerticalTabs from '../components/VerticalTabs';

class Index extends Component {
  render() {
    return (
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="homePageTabs"
          tabs={[
            { to: '/', name: 'Home', component: <Home /> },
            { to: '/search', name: 'Search', hidden: true, component: <Home /> },
            { to: '/templates', name: 'Templates', component: <GraphTemplates /> },
            { to: '/shared', name: 'Shared Graphs', component: <Shared /> },
          ]}
        />
      </Wrapper>
    );
  }
}

export default Index;
