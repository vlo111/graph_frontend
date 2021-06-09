import React, {Component} from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import PropTypes, { node } from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
// import EventEmitter from 'events';
import {setActiveButton} from '../../store/actions/app';
import Input from '../form/Input';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import {setActiveTab, getAllTabsRequest} from '../../store/actions/graphs';
import Chart from '../../Chart';
import queryString from 'query-string';
import Api from '../../Api';
// import ReactChart from '../chart/ReactChart';
// import handleFolderToggle from '../AutoSave';
import { getGraphNodesRequest } from '../../store/actions/graphs'
// import { toggleFolderRequest } from '../../store/actions/labels'


class SearchModal extends Component {
  // static event = new EventEmitter();
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

  handleChange = async (search = '') => {
    this.setState({ nodes: [], search, tabs:[], docs:[]});
    if (!search) {
      return;
    }
    if (search.length > 1) {
      this.displaySearchResultList(search)
    }
  }

  displaySearchResultList = async search => {
    const tabs = [];
    let tabArray = [];
    let myNodes = []
    
    const argument = {
      s: search,
      graphId: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
      findNode: false
    };
    
    const findedNodes = await this.props.getGraphNodesRequest(1, argument)
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

    if (findedNodes.payload.data.documents && findedNodes.payload.data.documents.length > 0) {
      docs = findedNodes.payload.data.documents[0]
      docs = docs.filter(nd => ifNodeExists(nd))
    }
    try {
      if (findedNodes.payload.data.graphs.length > 0) {
        const nodesList = findedNodes.payload.data.graphs[0].nodes
        nodesList.map(node => {
          if (nodesList.length > 1) {
            myNodes = nodesList
          }
          if (node.customFields.length) {
            node.customFields.map(tab => {
              if (tab.value === undefined) {return}
              const tabContent = tab.value;
              const tabName = tab.name;
              const tabContentHtml = document.createElement('div');
              tabContentHtml.innerHTML = tabContent;
              const tabSearchValue = tabContentHtml.textContent;
              if (tabContent.toLowerCase().includes(search.toLowerCase())) {
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
      console.log(e)
    }
    this.setState({ nodes: myNodes, search, tabs: tabArray, docs });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  }

  openFolder = async (label, node, tabName=false) => {
    label.open = true
    const graphId = window.location.pathname.substring(
      window.location.pathname.lastIndexOf('/') + 1
    )
    Api.toggleFolder(graphId, {id:label.id, open: true})

    const labelData = await Api.labelData(graphId, label.id)
    const nodes = await Chart.getNodes();
    const links = Chart.getLinks();
    nodes.push(...labelData.data.label.nodes);
    links.push(...labelData.data.label.links);

    this.closeModal();
    const lbs = Chart.getLabels().map(lb => {
      if(lb.id === label.id) {
        lb.open === true
      }
      return label
    })
    debugger

    // why I am sending only one label ???
    await Chart.render({ nodes, links, labels: lbs });
    const updatedNodesListInFront = Chart.getNodes()
    const theNode = updatedNodesListInFront.find(n => n.name === node.name)
    setTimeout(async () => {
      await ChartUtils.findNodeInDom(theNode);
      if (tabName) {
        this.props.setActiveTab(tabName);
      }
    }, 10);
    return theNode
  } 

  findNodeByTag = async (e, tagNode) => {
    const availableNodes = Chart.getNodes()
    const labels = Chart.getLabels()
    const isNodeAvailable =  availableNodes.find(nd => nd.id === tagNode.id)
    if(isNodeAvailable) {
      ChartUtils.findNodeInDom(isNodeAvailable);
      this.closeModal();
    } else {
      const label = labels.find(label => label.nodes.includes(tagNode.id))
      this.openFolder(label, tagNode)
    }
  }

  findNode = async (e, node) => {
    const availableNodes = Chart.getNodes()
    const labels = Chart.getLabels()
    const ifNode = !!node.tags ? false : true
    const isNodeAvailable =  availableNodes.find(nd => nd.id === node.id)
    
    if (isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.closeModal();
    }

    else if(ifNode) {
      await node.labels.map(async labelId => {
        const label = labels.find(lb => lb.id === labelId)
        if (label.type === "folder") {
          if (label.open === false) {
            this.openFolder(label, node)
          } 
        }
      })
    } 
  }

  openTab = async (node, tabName) => {
    const availableNodes = Chart.getNodes()
    const labels = Chart.getLabels()
    const isNodeAvailable =  availableNodes.find(nd => nd.id === node.id)
    if(isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.closeModal();
    } else {
      const label = labels.find(label => label.nodes.includes(node.id))
      await this.openFolder(label, node, tabName)
    }
    // this.props.setActiveTab(tabName);
    this.props.history.replace(`${window.location.pathname}?info=${node.id}`);
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
                            onClick={() => this.openTab(tabs[item].node, tabs[item][tab].tabName)}
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
              <div tabIndex="0" role="button" className="ghButton" onClick={(e) => this.findNode(e, d)}>
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
              <div tabIndex="0" role="button" className="ghButton" onClick={(e) => this.findNodeByTag(e, d)}>
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
