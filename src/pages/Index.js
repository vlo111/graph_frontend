import React, { Component } from 'react';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';
// import BackToTop from "react-back-to-top-button";

import GraphTemplates from './profile/GraphTemplates';
import Shared from './Shared';
import Home from './Home';
import VerticalTabs from '../components/PageTabs';
import Friends from './friends';
import { ReactComponent as ScrollUpSvg } from '../assets/images/icons/scroll-up.svg';


class Index extends Component {
  render() {
    return (
      <>
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="homePageTabs"
          //direction="horizontal"
          tabs={[
            { to: '/', name: 'Home', component: <Home /> },
            { to: '/search', name: 'Search', hidden: true, component: <Home /> },
            { to: '/templates', name: 'Templates', component: <GraphTemplates /> },
            { to: '/shared', name: 'Shared Graphs', component: <Shared /> },
            { to: '/friends', name: 'Friends', component: <Friends /> },
          ]}
        />
      </Wrapper>
      {/* <BackToTop
        //showOnScrollUp
        showAt={100}
        speed={1500}
        easing="easeInOutQuint"
      >
        <span><ScrollUpSvg className="icon" style={{ height: 40 }} /></span>
      </BackToTop> */}
      </>
    );
  }
}

export default Index;
