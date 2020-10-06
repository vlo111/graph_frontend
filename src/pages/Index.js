import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getGraphsListRequest } from '../store/actions/graphs';
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
        <VerticalTabs tabs={['Home', 'Templates', 'Shared Graphs']}>
          <Home />
          <GraphTemplates />
          <Shared />
        </VerticalTabs>
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsList: state.graphs.graphsList,
  graphsListInfo: state.graphs.graphsListInfo,
});

const mapDispatchToProps = {
  getGraphsListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Index);

export default Container;
