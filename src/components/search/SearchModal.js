import React, {Component} from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import PropTypes, { node } from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import {setActiveButton} from '../../store/actions/app';
import Input from '../form/Input';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import {setActiveTab, getAllTabsRequest} from '../../store/actions/graphs';
import Chart from '../../Chart';
import queryString from 'query-string';
import Api from '../../Api';
import { getGraphNodesRequest } from '../../store/actions/graphs'


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
    const { s } = queryString.parse(window.location.search);
    this.state = {
      nodes: [],
      tabs: [],
      text: s || '',
    };
  }

  initTabs = memoizeOne(() => {
    this.props.getAllTabsRequest(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
  })

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  handleChange = async (search = '') => {
    this.setState({ nodes: [], search, tabs:[]});
    if (!search) {
      return;
    }

    if (search.length > 2) {
      this.displayChanges(search)
    }
  }

  displayChanges = async search => {
    const tabs = [];
    let myNodes = []
    
    const argument = {
      s: search,
      graphId: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
      findNode: false
    };
    
    const findedNodes = await this.props.getGraphNodesRequest(1, argument)
    
    try {
      const nodesList = findedNodes.payload.data.graphs[0].nodes
      if (nodesList.length > 1) {
        myNodes = nodesList
      }
      
      nodesList.map(node => {
        if (node.customFields.length) {
          const tabContent = node.customFields[0].value;
          const tabName = node.customFields[0].value;
          const tabContentHtml = document.createElement('div');
          tabContentHtml.innerHTML = tabContent;
          const tabSearchValue = tabContentHtml.textContent;
          
          tabs.push({
            nodeId: node.id,
            node,
            tabName,
            tabContent,
            tabSearchValue,
          });
        }
      })

      const groupBy = (array, key) => array.reduce((result, obj) => {
        (result[obj[key]] = result[obj[key]] || []).push(obj);
        debugger
        if (obj.node.name.length > 42) {
          obj.node.name = obj.node.name.slice(0,40) + '...'
        }
        result[obj[key]].node = obj.node;
        return result;
      }, {});
  
      const tabArray = groupBy(tabs, 'nodeId');
      const tabNodes = Object.keys(tabArray)
      myNodes = myNodes.filter(node => !tabNodes.includes(node.id))
      this.setState({ nodes: myNodes, search, tabs: tabArray });
    } catch(e) {
      console.log('e', e)
    }
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
            <li className="item" key={tabs[item]?.node?.id}>
              <div tabIndex="0" role="button" className="ghButton tabButton">
                <div className="header">
                  <NodeIcon node={tabs[item].node}/>
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
                  <NodeIcon node={d}/>
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
  getGraphNodesRequest
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchModal);

export default Container;
