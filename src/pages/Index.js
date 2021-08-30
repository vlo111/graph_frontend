import React, { Component } from 'react';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';
// import BackToTop from "react-back-to-top-button";

import GraphTemplates from './profile/GraphTemplates';
import Shared from './Shared';
import Home from './Home';
import VerticalTabs from '../components/PageTabs';
import ScrollButton from '../components/ScrollButton';
import Friends from './friends'; 

class Index extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: 'tab_card',
    }
  }

setMode = (value) => {
  if(value && !value.type) {
    this.setState({
      mode: value,
    })
  }
}

  render() {
    const { mode } = this.state;

    return (
      <>
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="homePageTabs"
          //direction="horizontal"
          tabs={[
            { to: '/', name: 'Home', component: <Home mode={mode} /> },
            { to: '/search', name: 'Search', hidden: true, component: <Home /> },
            { to: '/templates', name: 'Templates', component: <GraphTemplates mode={mode} /> },
            { to: '/shared', name: 'Shared Graphs', component: <Shared  mode={mode} />  },
            { to: '/friends', name: 'Friends', component: <Friends /> },
          ]}
          onChange={(value) => this.setMode(value)}
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
