import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setActiveButton } from '../../store/actions/app';
import Input from '../form/Input';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import { setActiveTab, getAllTabsRequest } from '../../store/actions/graphs';
import Chart from '../../Chart';

class SearchModal extends Component {
  static propTypes = {
    getAllTabsRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    graphTabs: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      tabs: [],
    };
  }

  initTabs = memoizeOne(() => {
    this.props.getAllTabsRequest(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
  })

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  handleChange = async (search = '') => {
    if (!search.trim().toLowerCase()) {
      this.setState({ nodes: [], search });
      return;
    }
    const nodes = Chart.getNodes(true);

    const tabs = [];

    if (search.length > 2) {
      const { graphTabs } = this.props;

      if (graphTabs && graphTabs.length && !_.isEmpty(nodes)) {
        graphTabs.forEach((p) => {
          const node = nodes.filter((g) => g.id === p.nodeId)[0];

          const tabData = p.tab;

          tabData.forEach((tab) => {
            const tabContent = tab.value;

            const tabContentHtml = document.createElement('div');

            tabContentHtml.innerHTML = tabContent;

            const tabSearchValue = tabContentHtml.textContent;

            if (tab.name.toLowerCase().includes(search.toLowerCase())
              || tabSearchValue.toLowerCase().includes(search.toLowerCase())) {
              if (node.id && (node.id !== 'undefined')) {
                tabs.push({
                  nodeId: node.id,
                  node,
                  tabName: tab.name,
                  tabContent,
                  tabSearchValue,
                });
              }
            }
          });
        });
      }
    }

    const groupBy = (array, key) => array.reduce((result, obj) => {
      (result[obj[key]] = result[obj[key]] || []).push(obj);
      result[obj[key]].node = obj.node;
      return result;
    }, {});

    const tabArray = groupBy(tabs, 'nodeId');

    this.setState({ nodes, search, tabs: tabArray });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  }

  findNode = (node) => {
    ChartUtils.findNodeInDom(node);
    this.closeModal();
  }

  openTab = (node, tabName) => {
    this.props.setActiveTab(tabName);
    ChartUtils.findNodeInDom(node);
    this.props.history.replace(`${window.location.pathname}?info=${node.id}`);
    this.closeModal();
  }

  render() {
    const { nodes, tabs, search } = this.state;

    this.initTabs();

    return (
      <Modal
        isOpen
        className="ghModal ghModalSearch"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <Input
          label="Search"
          autoComplete="off"
          value={search}
          containerClassName="graphSearch"
          onChangeText={this.handleChange}
          autoFocus
        />
        <ul className="list">
          {Object.keys(tabs) && Object.keys(tabs).map((item) => (
            <li className="item" key={tabs[item].node.id}>
              <div tabIndex="0" role="button" className="ghButton tabButton">
                <div className="header">
                  <NodeIcon node={tabs[item].node} />
                  <div className="headerArea">
                    <span className="name">{tabs[item].node.name}</span>
                    <span className="type">{tabs[item].node.type}</span>
                  </div>
                </div>
                <div className="right">
                  {
                    Object.keys(tabs[item]).map((tab) => (
                      tabs[item][tab].nodeId && (
                      <div className="contentTabs">
                        <span className="row nodeTabs">
                          <div
                            className="contentWrapper"
                            onClick={() => this.openTab(tabs[item].node, tabs[item][tab].tabName)}
                          >
                            <span
                              title={tabs[item][tab].tabName}
                              className="name"
                              dangerouslySetInnerHTML={{ __html: this.formatHtml(tabs[item][tab].tabName) }}
                            />
                            <div className="content">
                              <span
                                className="type"
                                dangerouslySetInnerHTML={{ __html: this.formatHtml(tabs[item][tab].tabContent) }}
                              />
                            </div>
                          </div>
                        </span>
                        {!tabs[item][tab].tabName.toLowerCase().includes(search)
                          && !tabs[item][tab].tabSearchValue.toLowerCase().includes(search) ? (
                            <span
                              className="keywords"
                              dangerouslySetInnerHTML={{
                                __html: tabs[item][tab].keywords?.map((k) => this.formatHtml(k)).join(', '),
                              }}
                            />
                          ) : null}
                      </div>
                      )
                    ))
                  }
                </div>

              </div>
            </li>
          ))}
          {nodes.map((d) => (
            <li className="item" key={d.index}>
              <div tabIndex="0" role="button" className="ghButton" onClick={() => this.findNode(d)}>
                <div className="left">
                  <NodeIcon node={d} />
                </div>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.name) }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.type) }}
                    />
                  </span>

                  {!d.name.toLowerCase().includes(search) && !d.type.toLowerCase().includes(search) ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{ __html: d.keywords.map((k) => this.formatHtml(k)).join(', ') }}
                    />
                  ) : null}

                </div>

              </div>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  graphTabs: state.graphs.graphTabs,
});

const mapDispatchToProps = {
  setActiveTab,
  setActiveButton,
  getAllTabsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchModal);

export default Container;
