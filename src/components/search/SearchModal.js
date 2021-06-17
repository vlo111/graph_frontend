import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import PropTypes, { node } from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { setActiveButton } from "../../store/actions/app";
import Input from "../form/Input";
import NodeIcon from "../NodeIcon";
import ChartUtils from "../../helpers/ChartUtils";
import Utils from "../../helpers/Utils";
import { setActiveTab, getAllTabsRequest } from "../../store/actions/graphs";
import Chart from "../../Chart";
import queryString from "query-string";
import { getGraphNodesRequest } from "../../store/actions/graphs";

class SearchModal extends Component {
  static propTypes = {
    getAllTabsRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    graphTabs: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { s } = queryString.parse(window.location.search);
    this.state = {
      nodes: [],
      tabs: [],
      search: s || "",
      docs: [],
      keywords: [],
      checkBoxValues: {
        name: true,
        tag: true,
        tab: true,
        keyword: true,
        all: true,
      },
    };
  }

  initTabs = memoizeOne(() => {
    this.props.getAllTabsRequest(
      window.location.pathname.substring(
        window.location.pathname.lastIndexOf("/") + 1
      )
    );
  });

  closeModal = () => {
    this.props.setActiveButton("create");
  };

  /**
   * If search query have more then one symbol search it in back end
   *
   * @param {string} search
   * @returns
   */
  handleChange = async (search = "") => {
    this.setState({ nodes: [], search, tabs: [], docs: [], search });
    if (!search) {
      return;
    }
    if (search.length > 1) {
      this.displaySearchResultList(search);
    }
  };

  /**
   * Send search string to back end
   *
   * @returns
   */
  sendSearchInBackEnd = async (search) => {
    const argument = {
      s: search,
      graphId: window.location.pathname.substring(
        window.location.pathname.lastIndexOf("/") + 1
      ),
      findNode: false,
      searchParameters: this.state.checkBoxValues,
    };
    debugger;
    const searchResults = await this.props.getGraphNodesRequest(1, argument);
    return searchResults.payload.data;
  };

  /**
   * Search query in nodes, media tags, and node tabs and display result as a list
   *
   * @param {string} search
   */
  displaySearchResultList = async (search) => {
    const tabs = [];
    let tabArray = [];
    let keywords = [];
    let docs = [];
    let nodes = [];

    const foundNodes = await this.sendSearchInBackEnd(search);
    debugger;
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

    if (foundNodes.documents && foundNodes.documents.length > 0) {
      docs = foundNodes.documents[0];
      docs = docs.filter((nd) => ifNodeExists(nd));
    }
    nodes = foundNodes.nodes;
    keywords = foundNodes.keywords;

    try {
      if (foundNodes.tabs.length > 0) {
        const tabsList = foundNodes.tabs;
        if (tabsList.length > 0) {
          tabsList.map((node) => {
            if (node.customFields.length) {
              node.customFields.map((tab) => {
                if (tab.value === undefined) {
                  return;
                }
                const tabContent = tab.value;
                if (tabContent.toLowerCase().includes(search.toLowerCase())) {
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
        tabArray = groupBy(tabs, "nodeId");
      }
    } catch (e) {}
    // document.getElementsByClassName('list')
    this.setState({ nodes: [], search, tabs: [], docs: [] });
    this.setState({ nodes, search, tabs: tabArray, docs, keywords });
  };

  /**
   * find search string in text and make it bold
   *
   * @param {string} text
   * @returns
   */
  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), "ig"), "<b>$&</b>");
  };

  /**
   * Toggle folder and bring nodes inside it
   *
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
   *
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
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`
      );
    } else {
      const label = labels.find((label) => label.nodes.includes(tagNode.id));
      this.openFolder(e, label, tagNode);
    }
  };

  /**
   * Open chosen node if it's inside folder call openFolder
   *
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
   *
   * @param {object} e
   */
  handleCheckBoxChange = (e) => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    if (name == "all") {
      const checkBoxValues = this.state.checkBoxValues;
      for (const key in checkBoxValues) {
        _.set(checkBoxValues, key, value);
        this.setState({ checkBoxValues });
      }
    } else {
      const checkBoxValues = this.state.checkBoxValues;
      _.set(checkBoxValues, name, value);
      this.setState({ checkBoxValues });
    }
    this.handleChange(this.state.search);
  };

  render() {
    const { nodes, tabs, search, docs, keywords } = this.state;
    this.initTabs();

    return (
      <Modal
        isOpen
        className="ghModal ghModalSearch"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <div className="searchBox">
          <div className="searchFieldCheckBox">
            <div className="chooseSearchFields">Search By</div>
            <div className="searchFieldCheckBoxList">
              <div>
                <input
                  name="all"
                  type="checkbox"
                  checked={this.state.checkBoxValues.all}
                  onChange={this.handleCheckBoxChange}
                />
                All
              </div>
              <div>
                <input
                  name="name"
                  type="checkbox"
                  checked={this.state.checkBoxValues.name}
                  onChange={this.handleCheckBoxChange}
                />
                Name
              </div>
              <div>
                <input
                  name="tag"
                  type="checkbox"
                  checked={this.state.checkBoxValues.tag}
                  onChange={this.handleCheckBoxChange}
                />
                Tag
              </div>
              <div>
                <input
                  name="tab"
                  type="checkbox"
                  checked={this.state.checkBoxValues.tab}
                  onChange={this.handleCheckBoxChange}
                />
                Tab
              </div>
              <div>
                <input
                  name="keyword"
                  type="checkbox"
                  checked={this.state.checkBoxValues.keyword}
                  onChange={this.handleCheckBoxChange}
                />
                Keyword
              </div>
            </div>
          </div>
          <div
            className="searchInputBox"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Input
                label="Search"
                autoComplete="off"
                value={search}
                containerClassName="graphSearch"
                onChangeText={this.handleChange}
                autoFocus
              />
            </div>
          </div>
        </div>
        <ul className="list">
          {nodes.map((d) => (
            <li className="item" key={d.index}>
              <div
                tabIndex="0"
                role="button"
                className="ghButton"
                onClick={(e) => this.openNode(e, d)}
              >
                <div className="left">
                  <NodeIcon node={d} />
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
              <li className="item" key={tabs[item]?.node?.id}>
                <div tabIndex="0" role="button" className="ghButton tabButton">
                  <div className="header">
                    <NodeIcon node={tabs[item].node} />
                    <div className="headerArea">
                      <span className="name">{tabs[item].node.name}</span>
                      <span className="type">{tabs[item].node.type}</span>
                    </div>
                  </div>
                  <div className="right">
                    {Object.keys(tabs[item]).map(
                      (tab) =>
                        tabs[item][tab].nodeId && (
                          <div className="contentTabs">
                            <span className="row nodeTabs">
                              <div
                                className="contentWrapper"
                                onClick={(e) =>
                                  this.openTab(
                                    e,
                                    tabs[item].node,
                                    tabs[item][tab].tabName
                                  )
                                }
                              >
                                <span
                                  className="name"
                                  dangerouslySetInnerHTML={{
                                    __html: this.formatHtml(
                                      tabs[item][tab].tabName
                                    ),
                                  }}
                                />
                                <div className="content">
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
                            {!tabs[item][tab].tabName
                              .toLowerCase()
                              .includes(search) &&
                            !tabs[item][tab].tabSearchValue
                              .toLowerCase()
                              .includes(search) ? (
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
            <li className="item" key={d.index}>
              <div
                tabIndex="0"
                role="button"
                className="ghButton"
                onClick={(e) => this.openNode(e, d)}
              >
                <div className="left">
                  <NodeIcon node={d} />
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

          {docs.map((d, index) => (
            <li className="item" key={index}>
              <div
                tabIndex="0"
                role="button"
                className="ghButton"
                onClick={(e) => this.openNodeByTag(e, d)}
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
                        __html: this.formatHtml(d.tags.join(", ")),
                      }}
                    />
                  </span>

                  {d.description ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{ __html: d.description }}
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
  getGraphNodesRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(SearchModal);

export default Container;
