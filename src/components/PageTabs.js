import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import Button from './form/Button';
import { ReactComponent as CardDesign } from '../assets/images/icons/cardDesign.svg';
import { ReactComponent as ListDesign } from '../assets/images/icons/listDesign.svg';
import { ReactComponent as Filter } from '../assets/images/icons/filterGraph.svg';
import { getGraphsListRequest } from '../store/actions/graphs';
import { getShareGraphListRequest } from '../store/actions/share';
import GraphOrder from './graphData/GraphOrder';

class PageTabs extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    tabs: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    handleRouteChange: PropTypes.func,
    direction: PropTypes.oneOf(['vertical', 'horizontal']),
    getGraphsListRequest: PropTypes.func.isRequired,
    getShareGraphListRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 'tab_card',
      showFilterModal: false,
    };
  }

  static defaultProps = {
    handleRouteChange: undefined,
    direction: 'vertical',
  }
  setActiveTab = (tab) => {
    if (this.props.handleRouteChange) {
      this.props.handleRouteChange(tab);
    } else {
      this.props.history.push(tab.to);
    }
  }

  onChange = (mode) => {
    this.setState({
      selected: mode,
    });

    this.props.onChange(mode);
  }

  openFilter = (value) => {
    this.setState({
      showFilterModal: value,
    });
  }

  filter = (value) => {
    const { page = 1, s } = queryString.parse(window.location.search);

    const { path: currentTab } = this.props.match;

    if (currentTab === '/' || currentTab === '/templates') {
      const status = currentTab.includes('template') ? 'template' : 'active';
      this.props.getGraphsListRequest(page, { s, filter: value, status });
    } else if (currentTab === '/shared') {
      this.props.getShareGraphListRequest(page, { s, filter: value });
    } else if (currentTab === '/public') {
      this.props.getGraphsListRequest(page, {  filter: value, publicGraph:1 });
    }
  }

  toggleDropDown = () => {
    const { showFilterModal } = this.state;
    this.setState({ showFilterModal: !showFilterModal });
    if (!showFilterModal) {
      this.graphSearch();
    }
  }

  render() {
    const {
      children, tabs, location, history, match, className, direction, ...props
    } = this.props;
    const tab = tabs.find((t) => t.to === location.pathname);
    const list = direction === 'vertical' ? _.reverse([...tabs]) : tabs;
    const isHome = direction === 'vertical' && className === 'homePageTabs';
    const { selected, showFilterModal } = this.state;

    const { path: currentTab } = this.props.match;
    return (
      <div id="verticalTabs" className={`${direction} ${!isHome ? className : 'homeWithUser'}`} {...props}>
        <ul className={`tabsList ${selected}`}>
          <li className="lastItem">
            <div className="cart-item" onClick={() => this.onChange('tab_card')}>
              <CardDesign />
            </div>
            <div className="list-item" onClick={() => this.onChange('list')}>
              <ListDesign />
            </div>
            <div onClick={() => this.openFilter(!showFilterModal)} className="filter">
              <Filter />
            </div>
          </li>
          {list.filter((t) => !t.hidden).map((t) => (
            <li key={t.name} className={`item ${t.to === location.pathname ? 'active' : ''}`}>
              <Button onClick={() => this.setActiveTab(t)}>
                { t.name === 'Public' ?
                <i className="fa fa-globe"></i>
                 :null}
                {t.name}
              </Button>
            </li>
          ))}
        </ul>

        <GraphOrder
          filter={this.filter}
          toggleDropDown={this.toggleDropDown}
          currentTab={currentTab}
          showFilterModal={showFilterModal}
        />

        <div className="content">
          {tab?.component}
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  getGraphsListRequest,
  getShareGraphListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PageTabs);

export default withRouter(Container);
