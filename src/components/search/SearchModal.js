import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import Input from '../form/Input';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import { setActiveTab } from '../../store/actions/graphs';

class SearchModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    customFields: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setActiveTab: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      tabs: [],
    };
  }

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  handleChange = (search = '') => {
    if (!search.trim().toLowerCase()) {
      this.setState({ nodes: [], search });
      return;
    }
    const { customFields } = this.props;
    const nodes = ChartUtils.nodeSearch(search);

    const tabs = [];

    if (search.length > 2) {
      const nodeTypes = Object.keys(customFields);

      nodeTypes.forEach((nmodeType) => {
        const tabNames = Object.keys(customFields[nmodeType]);

        tabNames.forEach((tabName) => {
          let tabValue = customFields[nmodeType][tabName].values;

          const nodeId = Object.keys(tabValue)[0];

          tabValue = tabValue[nodeId];

          const node = ChartUtils.getNodeById(nodeId);

          const tabContentHtml = document.createElement('div');

          tabContentHtml.innerHTML = tabValue;

          const tabSearchValue = tabContentHtml.textContent;

          if (tabName.toLowerCase().includes(search.toLowerCase())
              || tabSearchValue.toLowerCase().includes(search.toLowerCase())) {
            if (nodeId && (nodeId !== 'undefined')) {
              tabs.push({
                nodeId: node.id,
                node,
                tabName,
                tabValue,
                tabSearchValue,
              });
            }
          }
        });
      });
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
                                dangerouslySetInnerHTML={{ __html: this.formatHtml(tabs[item][tab].tabValue) }}
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
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setActiveTab,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchModal);

export default Container;
