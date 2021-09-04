import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { setActiveButton, toggleSearch } from "../../store/actions/app";
import NodeIcon from "../NodeIcon";
import ChartUtils from "../../helpers/ChartUtils";
import Utils from "../../helpers/Utils";
import { setActiveTab, getAllTabsRequest } from "../../store/actions/graphs";
import Chart from "../../Chart";
import queryString from "query-string";
import { toggleGraphMap, toggleExplore } from '../../store/actions/app';
import { getGraphNodesRequest } from "../../store/actions/graphs";
import { ReactComponent as DownSvg } from '../../assets/images/icons/down.svg';
import Button from "../form/Button";
import Checkbox from '../form/Checkbox';

class SearchModal extends Component {
  static propTypes = {
    getAllTabsRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    toggleSearch: PropTypes.func.isRequired,
    toggleExplore: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    graphTabs: PropTypes.array.isRequired,
    graphId: PropTypes.number.isRequired,
    singleGraph: PropTypes.object.isRequired,
    userId: PropTypes.number.isRequired,
    currentUserId: PropTypes.number.isRequired, 
  };

  constructor(props) {
    super(props);
    const { s } = queryString.parse(window.location.search);
    this.state = {
      nodes: [],
      tabs: [],
      search: "",
      docs: [],
      keywords: [],
      checkBoxValues: {
        name: true,
        tab: true,
        tag: true,
        keyword: true,
      },
      tabsContentVisibility: {},
      checkBoxAll: true,
      allNodesSelected: false,
      chosenNodes: [],
      toggleFilterBox: false
    };
  }

  componentWillUnmount() {
    const { nodes, links } = this.props.singleGraph
    const chartNodes = Chart.getNodes()
    if (!chartNodes.length && nodes?.length) {
      Chart.render({nodes, links}, {ignoreAutoSave: true,})
    } else {
      this.props.toggleExplore(true)
    }
  }

  initTabs = memoizeOne(() => {
    const { graphId } = this.props
    this.props.getAllTabsRequest(graphId);
  });

  closeModal = () => {
    this.props.toggleSearch(false);
  };

  /**
   * If search query have more then one symbol search it in back end
   * @param {string} search
   * @returns
   */
  handleChange = async (search = "") => {
    this.setState({ 
      nodes: [], 
      tabs: [], 
      docs: [], 
      search,
      keywords: [],  
      chosenNodes: [],
      allNodesSelected: false
    });
    if (!search) {
      return;
    }
    if (search.length > 1) {
      this.displaySearchResultList(search);
    }
  };

  /**
   * Send search string to back end
   * @returns
   */
  searchResults = async (search) => {
    const { graphId, currentUserId, userId } = this.props
    const { checkBoxValues } = this.state
    const argument = {
      s: search,
      graphId,
      findNode: false,
      searchParameters: checkBoxValues,
      isOwner: currentUserId === userId ? true : false
    };
    const searchResults = await this.props.getGraphNodesRequest(1, argument);
    return searchResults.payload.data;
  };

  /**
   * Search query in nodes, media tags, and node tabs and display result as a list
   * @param {string} search
   */
  displaySearchResultList = async (search) => {
    const tabs = [];
    let tabArray = [];
    let keywords = [];
    let docs = [];
    let nodes = [];
    
    const foundNodes = await this.searchResults(search);
    const ifNodeExists = (node) => {
      const frontNodes = Chart.getNodes();
      if (frontNodes.filter((nd) => nd.id === node.id).length) {
        return true;
      }

      const labels = Chart.getLabels();
      if (labels.filter((label) => label.nodes.includes(node.id)).length) {
        return true;
      }
      return false;
    };

    if (foundNodes.tags && foundNodes.tags.length > 0) {
      docs = !!foundNodes.tags ? foundNodes.tags : [];
      docs = docs.filter((nd) => ifNodeExists(nd));
    }
    nodes = !!foundNodes.nodes ? foundNodes.nodes : [];
    keywords = !!foundNodes.keywords ? foundNodes.keywords : [];
    
    try {
      if (foundNodes?.tabs?.length > 0) {
        const tabsList = foundNodes.tabs;
        if (tabsList.length > 0) {
          const tabsContentVisibility = {}
          tabsList.map((node) => {
            // set all tabs content visibility false
            tabsContentVisibility[`content_${node.id.replace('.','_')}`] = false
            if (node.customFields?.length) {
              node.customFields.map((tab) => {
                if (tab.value === undefined) {
                  return;
                }
                const tabContent = tab.value;
                const html = document.createElement('div');
                html.innerHTML = tabContent;
                const tagsElement = html.getElementsByClassName('tags')
                if (tagsElement.length) {
                  tagsElement[0].remove()
                }
                const cleanedText = html.innerText
                  if (cleanedText.toLowerCase().includes(search.toLowerCase())) {
                  const tabName = tab.name;
                  const tabContentHtml = document.createElement("div");
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
              });
            }
          });
        }
        const groupBy = (array, key) =>
          array.reduce((result, obj) => {
            (result[obj[key]] = result[obj[key]] || []).push(obj);
            if (obj.node.name.length > 40) {
              obj.node.name = obj.node.name.slice(0, 40) + "...";
            }
            result[obj[key]].node = obj.node;
            return result;
          }, {});
        tabArray = groupBy(tabs, "nodeId") ?? [];
      }
    } catch (e) {}
    this.setState({ nodes, tabs: tabArray, docs, keywords });
  };

  /**
   * Find search string in text and make it bold
   * @param {string} text
   * @returns
   */
  formatHtml = (text, type=undefined) => {
    if (type === 'keywords') {
    }
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), "ig"), "<b>$&</b>");
  };

  /**
   * Toggle folder and bring nodes inside it
   * @param {object} e
   * @param {object} label
   * @param {object} node
   * @param {string} tabName
   */
  openFolder = (e, label, node, tabName = false) => {
    label.open = true;
    Chart.event.emit("folder.open", e, label);
    const lbs = Chart.getLabels().map((lb) => {
      if (lb.id === label.id) {
        lb.open = true;
      }
      return lb;
    });
    Chart.render({ labels: lbs });
    this.closeModal();

    setTimeout(() => {
      const nodes = Chart.getNodes();
      const theNode = nodes.find((n) => n.id === node.id);
      if (theNode) {
        ChartUtils.findNodeInDom(node);
      }
      if (tabName) {
        this.props.setActiveTab(tabName);
      }
      this.props.history.replace(`${window.location.pathname}?info=${node.id}`);
    }, 500);
  };

  /**
   * Open node which contains searched tags if it's inside folder call openFolder
   * @param {object} e
   * @param {object} tagNode
   */
  openNodeByTag = async (e, tagNode) => {
    const availableNodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const isNodeAvailable = availableNodes.find((nd) => nd.id === tagNode.id);
    if (isNodeAvailable) {
      this.closeModal();
      ChartUtils.findNodeInDom(isNodeAvailable);
      if (tagNode.tabName) {
        this.props.setActiveTab(tagNode.tabName);
      }
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`
      );
    } else {
      const label = labels.find((label) => label.nodes.includes(tagNode.id));
      if (tagNode.tabName) {
        this.openFolder(e, label, tagNode, tagNode.tabName);
      } else {
        this.openFolder(e, label, tagNode);
      }
    }
  };

  /**
   * Open chosen node if it's inside folder call openFolder
   * @param {object} e
   * @param {object} node
   */
  openNode = async (e, node) => {
    const availableNodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const ifNode = !!node.tags ? false : true;
    const isNodeAvailable = availableNodes.find((nd) => nd.id === node.id);
    if (isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`
      );
      this.closeModal();
    } else if (ifNode) {
      await node.labels.map(async (labelId) => {
        const label = labels.find((lb) => lb.id === labelId);
        if (label && label.type === "folder") {
          if (label.open === false) {
            this.openFolder(e, label, node);
          }
        }
      });
    }
  };

  /**
   * Open chosen tab of node if it's inside folder call openFolder
   * @param {*} e
   * @param {*} node
   * @param {*} tabName
   */
  openTab = (e, node, tabName) => {
    const availableNodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const isNodeAvailable = availableNodes.find((nd) => nd.id === node.id);
    if (isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.props.setActiveTab(tabName);
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`
      );
      this.closeModal();
    } else {
      const label = labels.find((label) => label.nodes.includes(node.id));
      if (label) {
        this.openFolder(e, label, node, tabName);
      }
    }
  };

  /**
   * Filter user search by name, tab, tag, keywords
   * @param {object} e
   */
  handleFilterCheckBoxChange = (e) => {
    const { checkBoxValues, search } = this.state;
    const target = e.target;
    const name = target.innerText.toLowerCase();
    if (name == "all") {
      let value = true
      const checkBoxFields = Object.values(checkBoxValues).filter(el => el === value)
      if (checkBoxFields.length === 4) {
        value = false
      } else {
        value = true
      }
      const allCheckElements = Array.from(document.getElementsByClassName("checkBox"))
      
      allCheckElements.map(element => {
        element.style.color = value ? "#7166F8" : "#BEBEBE";
      })
      this.setState({checkBoxAll:value})
      for (const key in checkBoxValues) {
        _.set(checkBoxValues, key, value);
        this.setState({ checkBoxValues });
      }
      
    } else {
      const value = !checkBoxValues[name]
      _.set(checkBoxValues, name, value);
      this.setState({ checkBoxValues });
      target.style.color = value ? "#7166F8" : "#BEBEBE";
      const checkBoxFields = Object.values(checkBoxValues).filter(el => el === value)
      if (checkBoxFields.length === 4) {
        this.setState({checkBoxAll:value})
        Array.from(document.getElementsByClassName("checkBoxall")).map(element => element.style.color = value ? "#7166F8" : "#BEBEBE")
      }
    }
    this.handleChange(search);
  };

  findNodeInDom = (node, closeModal=true) => {
    if (closeModal === 'closeMap') {
    } else if (closeModal) {
      this.closeModal();
    } else {
    }
    const nodeInDom = Chart.getNodes().find(nd => nd.id === node.id)
    ChartUtils.findNodeInDom(nodeInDom)
  }

  handleTabToggle = (ev, id, tabName) => {
    const { tabsContentVisibility } = this.state
    ev.stopPropagation()
    const idName = `content_${id.replace('.','_')}_${tabName.replaceAll(' ','_')}`
    const contentWrapper = document.getElementById(idName)
    const isVisible = tabsContentVisibility[idName]

    contentWrapper.style.display = isVisible ? 'none' :'block'
    _.set(tabsContentVisibility, idName, !isVisible)
  }

  /**
   * handle check box if last unselected node was selected change select all to unselect
   * @param {obj} ev 
   * @param {obj} node 
   */
  handleNodesCheckBoxChange = (ev, node, name) => {
    if (name) {
      const chosenCheckBox = document.getElementsByName(name)[0]
      chosenCheckBox.checked = !chosenCheckBox.checked
    } else {
      name = ev.target.name
    }
    const { chosenNodes } = this.state;
    const ifExists = chosenNodes.find((nd) => nd.code === name);

    const listClass = document.getElementsByClassName('list')[0];
    const allCheckboxes = Array.from(listClass.children);
    const allNodesSelected = !allCheckboxes.find((el) => el.firstChild.firstChild.checked === false);

    if (ifExists) {
      const index = chosenNodes.indexOf(ifExists);
      chosenNodes.splice(index, 1);
      if (!chosenNodes.length) {
        this.setState({ allNodesSelected });
      }
    } else {
      node.code = name;
      chosenNodes.push(node);
    }

    if (allNodesSelected) {
      this.setState({ allNodesSelected: true });
    }
    else {
      this.setState({ allNodesSelected: false });
    }

    this.setState({ chosenNodes });
  }

  /**
   * display only selected nodes with connections between them 
   * @param {obj} ev 
   */
  showSelectedNodes = ( keep = false ) => {
    let { chosenNodes } = this.state;
    const { linksPartial } = this.props;
    
    let oldNodes = Chart.getNodes()
    let oldLinks = Chart.getLinks()
    
    chosenNodes = chosenNodes.map(node => {
      node.new = true
      return node
    })

    if (keep) {
      chosenNodes = chosenNodes.concat(oldNodes)
    }
    chosenNodes = chosenNodes.filter( (node, position) => {
      return chosenNodes.findIndex(n => n.id === node.id) === position
    })

    const links = Chart.getLinksBetweenNodes(chosenNodes, linksPartial);
    let newLinks = links.filter(link => !oldLinks.find(oldLink => oldLink.id === link.id)) 
    newLinks = newLinks.map(lks => {
      lks.new = true
      return lks
    })
    newLinks = newLinks.concat(oldLinks)
    Chart.render(
      {
        nodes: chosenNodes, 
        links: newLinks, 
        labels: []
      }, {
        ignoreAutoSave: true,
        isAutoPosition: true
    })
    ChartUtils.autoScaleTimeOut();
    ChartUtils.autoScaleTimeOut(100);
    ChartUtils.autoScaleTimeOut(200);
    this.closeModal();
    ChartUtils.startAutoPosition()
  }

  /**
   * handle select all / unselect all button event
   * @param {*} ev 
   */
  selectAllNodes = ev => {
    let { chosenNodes, nodes, keywords, docs, tabs} = this.state
    let nodeList = []

    const listClass = document.getElementsByClassName('list')[0];
    const allCheckboxes = Array.from(listClass.children);
    const allNodesSelected = !allCheckboxes.find((el) => el.firstChild.firstChild.checked === false);

    if (allNodesSelected) {
      allCheckboxes.map((el) => el.firstChild.firstChild.checked = false);
    } else {
      allCheckboxes.map((el) => el.firstChild.firstChild.checked = true);

      nodeList = nodes.concat(keywords)?.concat(docs);
      for (const tab in tabs) {
        nodeList.push(tabs[tab].node);
      }
    }
    this.setState({chosenNodes: nodeList, allNodesSelected: !allNodesSelected})

  }

  ifAnyResults = () => {
    const {nodes, keywords, docs, tabs} = this.state
    if (nodes?.length || keywords?.length || docs?.length || Object.keys(tabs)?.length) {
      return true
    }
    return false
  }

  toggleFilter = () => {
    const { toggleFilterBox } = this.state
    const searchFieldCheckBox = document.getElementsByClassName('searchFieldCheckBoxList')[0]
    searchFieldCheckBox.style.display = !toggleFilterBox ? 'flex' : 'none'
    this.setState({toggleFilterBox: !toggleFilterBox})
  }

  render() {
    const { 
      nodes, 
      tabs,
      search, 
      docs, 
      keywords, 
      checkBoxValues,
      chosenNodes, 
      allNodesSelected 
    } = this.state;
    this.initTabs();
    const chartNodes = Chart.getNodes()
    return (
      <Modal
        isOpen
        className="ghModal ghModalSearch searchNodes"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <div className="searchField">
        <div className="searchText">Search</div>
        <div className="searchBox">
          <div className="searchBoxInside">
            <div className="searchFieldCheckBox">
              <div className="chooseSearchFields"  onClick={this.toggleFilter}>
                Filters
                <svg className="dropDownSvg" width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.313 0H0.692176C0.25364 0 0.00877185 0.463023 0.280353 0.779125L7.59077 9.25601C7.80002 9.49865 8.20294 9.49865 8.41442 9.25601L15.7248 0.779125C15.9964 0.463023 15.7516 0 15.313 0Z" fill="#7166F8"/>
                </svg>

              </div>
              <div className="searchFieldCheckBoxList">
                <div 
                  onClick={this.handleFilterCheckBoxChange}
                  className={"checkBox checkBoxall"}
                >
                  All
                </div>
                {Object.keys(checkBoxValues).map( field => (
                  <div 
                    onClick={this.handleFilterCheckBoxChange}
                      className={`checkBox checkBox${field}`}
                  >
                  {field}
                  </div>
                ))}
              </div>
            </div>
            <input
              autoComplete="off"
              value={search}
              className="nodeSearch"
              onChange={(e) => this.handleChange(e.target.value)}
              autoFocus
            />
          </div>
          {this.ifAnyResults() ? (
          <div className="selectedNodesCheckBox">
            <div>
                  <Checkbox
                    label="Select all"
                    checked={allNodesSelected}
                    onChange={this.selectAllNodes}
                  />
                </div>
                <p className="selectedItemsAmount">
                  Selected Nodes
                  {` ${chosenNodes.length}`}
                </p>
              </div>
            ) : ''}
        </div>

        </div>
        <ul className="list"> 
          {nodes.map((d) => (
            <li
              className="item nodeItem"
              key={`node_${d.id}`}
            >
              <Checkbox
                name={`name_${d.id}`}
                checked={this.state.isChecked}
                onChange={(e) => this.handleNodesCheckBoxChange(e, d)}
              />
              <div
                tabIndex="0"
                role="button"
                className="ghButton searchItem"
                onClick={(e) => this.handleNodesCheckBoxChange(e, d, `name_${d.id}`)}
              >
                <div className="left">
                  <NodeIcon node={d} searchIcon={true}/>
                </div>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      title={d.name}
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.name),
                      }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.type),
                      }}
                    />
                  </span>

                  {!d.name.toLowerCase().includes(search) &&
                  !d.type.toLowerCase().includes(search) ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{
                        __html: d.keywords
                          .map((k) => this.formatHtml(k))
                          .join(", "),
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          ))}

          {Object.keys(tabs) &&
            Object.keys(tabs).map((item) => (
              <li
                className="item tabItem" 
                key={'tab_'+tabs[item]?.node?.id} 
                >
                <Checkbox
                  name={`tab_${tabs[item]?.node?.id}`}
                  checked={this.state.isChecked}
                  onChange={(e) => this.handleNodesCheckBoxChange(e, tabs[item].node)}
                />
                <div tabIndex="0" role="button" className="ghButton tabButton">
                  <div className="header" onClick={ (e) => this.handleNodesCheckBoxChange(e, tabs[item].node, `tab_${tabs[item]?.node?.id}`)}>
                      <NodeIcon node={tabs[item].node} searchIcon={true}/>
                      <span className="name">{tabs[item].node.name}</span>
                  </div>
                  <div className="right tabRight">
                    {Object.keys(tabs[item]).map(
                      (tab) =>
                      tabs[item][tab].nodeId && (
                        <div className="contentTabs">
                            <span className="row nodeTabs">
                              <div
                                className="contentWrapper"
                                onClick={(e) =>
                                  this.handleNodesCheckBoxChange(
                                    e,
                                    tabs[item].node,
                                    `tab_${tabs[item]?.node?.id}`
                                    )
                                  }
                              >
                                <div className="tabNameLine" >
                                  <span className="nodeType"> <span className='typeText'>Type:</span> {tabs[item].node.type}</span>
                                  <div className="toggleTabBox">
                                    <DownSvg onClick={(ev) => {this.handleTabToggle(ev, tabs[item]?.node?.id, tabs[item][tab].tabName)}}/>
                                  </div>
                                </div>
                                <span
                                  className="name"
                                  dangerouslySetInnerHTML={{
                                    __html: this.formatHtml(
                                      tabs[item][tab].tabName
                                      ),
                                    }}
                                />
                                <div 
                                  className="content"
                                  id={`content_${tabs[item]?.node?.id.replace('.','_')}_${tabs[item][tab].tabName.replaceAll(' ','_')}`}
                                >
                                  <span
                                    className="type"
                                    dangerouslySetInnerHTML={{
                                      __html: this.formatHtml(
                                        tabs[item][tab].tabContent
                                      ),
                                    }}
                                  />
                                </div>
                              </div>
                            </span>
                            {!tabs[item][tab].tabName.toLowerCase().includes(search) &&
                            !tabs[item][tab].tabSearchValue.toLowerCase().includes(search) ? (
                              <span
                                className="keywords"
                                dangerouslySetInnerHTML={{
                                  __html: tabs[item][tab].keywords
                                    ?.map((k) => this.formatHtml(k))
                                    .join(", "),
                                }}
                              />
                            ) : null}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </li>
            ))}

          {keywords.map((d) => (
            <li 
              className="item" 
              key={'keywords_'+d.id}
            >  
              <Checkbox
                name={`keyword_${d.id}`}
                checked={this.state.isChecked}
                onChange={(e) => this.handleNodesCheckBoxChange(e, d)}
              />
              <div
                tabIndex="0"
                role="button"
                className="ghButton searchItem"
                onClick={(e) => this.handleNodesCheckBoxChange(e, d, `keyword_${d.id}`)}
              >
                <div className="left">
                  <NodeIcon node={d} searchIcon={true}/>
                </div>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      title={d.name}
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.name, 'name'),
                      }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.type),
                      }}
                    />
                  </span>

                  {(
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.keywords.join(", "), 'keywords')
                      }}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}

          {docs.map((d) => (
            <li 
              className="item" 
              key={'docs_'+d.id}
            >
              <Checkbox
                name={`docs_${d.id}`}
                checked={this.state.isChecked}
                onChange={(e) => this.handleNodesCheckBoxChange(e, d)}
              />
              <div
                tabIndex="0"
                role="button"
                className="ghButton searchItem"
                onClick={(e) => this.handleNodesCheckBoxChange(e, d, `docs_${d.id}`)}
              >
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.name),
                      }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.type),
                      }}
                    />
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="acceptCheckedItems">
            {chosenNodes.length ? (
              <>
                <Button
                  onClick={(ev) => this.showSelectedNodes()}
                  className="ghButton btn-classic"
                >
                  Show
                </Button>
                {chartNodes.length ? <Button
                  onClick={(ev) => this.showSelectedNodes(true)}
                  className="ghButton btn-classic"
                >
                  Add to existing
                </Button> : ''}
              </>
            ) : (
              ''
            )}
          </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  graphTabs: state.graphs.graphTabs,
  graphId: state.graphs.singleGraph.id,
  singleGraph: state.graphs.singleGraph,
  userId: state.graphs.singleGraph.userId,
  currentUserId: state.account.myAccount.id,
  linksPartial: state.graphs.singleGraph?.linksPartial || [],
});

const mapDispatchToProps = {
  setActiveTab,
  setActiveButton,
  getAllTabsRequest,
  getGraphNodesRequest,
  toggleGraphMap,
  toggleSearch,
  toggleExplore, 
};

const Container = connect(mapStateToProps, mapDispatchToProps)(SearchModal);

export default Container;
