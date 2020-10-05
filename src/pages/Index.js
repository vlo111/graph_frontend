import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  Tabs, Tab,
  Col, Row, Nav, NavItem, Container as Containers,
} from 'react-bootstrap';
import { getGraphsListRequest } from '../store/actions/graphs';
import Wrapper from '../components/Wrapper';
import Button from '../components/form/Button';
import Utils from '../helpers/Utils';
import Pagination from '../components/Pagination';
import Header from '../components/Header';

import GraphTemplates from './profile/GraphTemplates';
import Shared from './Shared';
import Home from './Home';

class Index extends Component {
  render() {
    return (
      <div className="container">
        <Header />

        <div className="indexTabs">
          <Containers style={{ width: 'auto' }}>
            <Tab.Container id="left-tabs-example" unmountOnExit defaultActiveKey="first" role="tabpanel">
              <Row style={{ padding: '1em 1em', background: '#EEEEEE' }}>
                <Col sm={2}>
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                      <Nav.Link eventKey="first">Home</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="second">Templates</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="third" icon="fa-pencil">Shared Graphs</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col sm={10}>
                  <Tab.Content className="tab-content">
                    <Tab.Pane eventKey="first" style={{ height: '90vh' }}>
                      <Home />
                    </Tab.Pane>
                    <Tab.Pane eventKey="second" style={{ height: '90vh' }}>
                      <GraphTemplates />
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">
                      <Shared />
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Containers>
        </div>
      </div>
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
