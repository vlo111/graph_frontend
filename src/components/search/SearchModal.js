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
// import Api from '../../Api';
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
      docs: []
    };
  }

  initTabs = memoizeOne(() => {
    this.props.getAllTabsRequest(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
  })

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  /**
   * If search query have more then one symbol search it in back end 
   * 
   * @param {string} search 
   * @returns 
   */
  handleChange = async (search = '') => {
    this.setState({ nodes: [], search, tabs:[], docs:[]});
    if (!search) {
      return;
    }
    if (search.length > 1) {
      this.displaySearchResultList(search)
    }
  }

  /**
   * Search query in nodes, media tags, and node tabs and display result as a list
   * 
   * @param {string} search 
   */
  displaySearchResultList = async search => {
    const tabs = [];
    let tabArray = [];
    let myNodes = []
    
    const argument = {
      s: search,
      graphId: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
      findNode: false
    };
    
    const foundNodes = await this.props.getGraphNodesRequest(1, argument)
    let docs = []

    const ifNodeExists = (node) => {
      const nodes =  Chart.getNodes()
      if (nodes.filter(nd => nd.id === node.id).length) {
        return true
      }
      const labels = Chart.getLabels()
      if (labels.filter(label => label.nodes.includes(node.id)).length) {
        return true
      }
      return false
    }

    if (foundNodes.payload.data.documents && foundNodes.payload.data.documents.length > 0) {
      docs = foundNodes.payload.data.documents[0];
      docs = docs.filter(nd => ifNodeExists(nd));
    }
    try {
      if (foundNodes.payload.data.graphs.length > 0) {
        const nodesList = foundNodes.payload.data.graphs[0].nodes
        nodesList.map(node => {
          if (nodesList.length > 0) {
            myNodes = nodesList;
          }
          if (node.customFields.length) {
            node.customFields.map(tab => {
              if (tab.value === undefined) {
                return;
              }
              const tabContent = tab.value;
              if (tabContent.toLowerCase().includes(search.toLowerCase())) {
                const tabName = tab.name;
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
          }
        })

        const groupBy = (array, key) => array.reduce((result, obj) => {
          (result[obj[key]] = result[obj[key]] || []).push(obj);
          if (obj.node.name.length > 40) {
            obj.node.name = obj.node.name.slice(0,40) + '...'
          }
          result[obj[key]].node = obj.node;
          return result;
        }, {});
        tabArray = groupBy(tabs, 'nodeId');
      }
    } catch(e) {
      console.log(e);
    }
    this.setState({ nodes: myNodes, search, tabs: tabArray, docs });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  }

  /**
   * Toggle folder and bring nodes inside it
   * 
   * @param {object} e 
   * @param {object} label 
   * @param {object} node 
   * @param {string} tabName 
   */
  openFolder =  (e, label, node, tabName=false) => {
    label.open = true
    Chart.event.emit('folder.open', e, label)
    const lbs = Chart.getLabels().map(lb => {
      if(lb.id === label.id) {
        lb.open = true
      }
      return label
    })
    Chart.render({labels:lbs})
    this.closeModal();

    setTimeout(() => {
      const nodes = Chart.getNodes()
      // use to navigate through tabs
      const theNode = nodes.find(n => n.id === node.id)
      if (theNode) {
        ChartUtils.findNodeInDom(node);
      }
      this.props.history.replace(`${window.location.pathname}?info=${node.id}`);
      if (tabName) {
        console.log('tabName: ', tabName);
        this.props.setActiveTab(tabName);
      }
    }, 500);
  } 

  /**
   * Open node which contains searched tags if it's inside folder call openFolder
   * 
   * @param {object} e 
   * @param {object} tagNode 
   */
  openNodeByTag = async (e, tagNode) => {
    const availableNodes = Chart.getNodes()
    const labels = Chart.getLabels()
    const isNodeAvailable =  availableNodes.find(nd => nd.id === tagNode.id)
    if(isNodeAvailable) {
      this.closeModal();
      ChartUtils.findNodeInDom(isNodeAvailable);
      this.props.history.replace(`${window.location.pathname}?info=${isNodeAvailable.id}`);
    } else {
      const label = labels.find(label => label.nodes.includes(tagNode.id))
      this.openFolder(e, label, tagNode)
    }
  }

  /**
   * Open chosen node if it's inside folder call openFolder
   * 
   * @param {object} e 
   * @param {object} node 
   */
  openNode = async (e, node) => {
    const availableNodes = Chart.getNodes()
    const labels = Chart.getLabels()
    const ifNode = !!node.tags ? false : true
    const isNodeAvailable =  availableNodes.find(nd => nd.id === node.id)
    if (isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.props.history.replace(`${window.location.pathname}?info=${isNodeAvailable.id}`);
      this.closeModal();
    }

    else if(ifNode) {
      await node.labels.map(async labelId => {
        const label = labels.find(lb => lb.id === labelId)
        if (label && label.type === "folder") {
          if (label.open === false) {
            this.openFolder(e, label, node)
          } 
        }
      })
    } 
  }

  /**
   * Open chosen tab of node if it's inside folder call openFolder
   * @param {*} e 
   * @param {*} node 
   * @param {*} tabName 
   */
  openTab = (e, node, tabName) => {
    const availableNodes = Chart.getNodes()
    const labels = Chart.getLabels()
    const isNodeAvailable =  availableNodes.find(nd => nd.id === node.id)
    if(isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.props.history.replace(`${window.location.pathname}?info=${isNodeAvailable.id}`);
      this.closeModal();
    } else {
      const label = labels.find(label => label.nodes.includes(node.id))
      if (label) {
        this.openFolder(e, label, node, tabName)
      }
    }
  }

  render() {
    const { nodes, tabs, search, docs } = this.state;
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
                            onClick={(e) => this.openTab(e, tabs[item].node, tabs[item][tab].tabName)}
                          >
                            <span
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
              <div tabIndex="0" role="button" className="ghButton" onClick={(e) => this.openNode(e, d)}>
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
          {docs.map((d, index) => (
            <li className="item" key={index}>
              <div tabIndex="0" role="button" className="ghButton" onClick={(e) => this.openNodeByTag(e, d)}>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.name) }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.tags.join(', ')) }}
                    />
                  </span>

                  {d.description ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{ __html: d.description}}
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
  // toggleFolderRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchModal);

export default Container;
