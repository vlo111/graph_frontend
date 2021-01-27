import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Wrapper from '../components/Wrapper';
import { setActiveButton } from '../store/actions/app';
import Button from '../components/form/Button';
import { clearSingleGraph, getSingleGraphRequest } from '../store/actions/graphs';
import { userGraphRequest } from '../store/actions/shareGraphs';
import Api from '../Api';
import Header from '../components/Header';
import Select from '../components/form/Select';
import GraphCompareList from '../components/graphCompare/GraphCompareList';
import ChartUtils from '../helpers/ChartUtils';
import CreateGraphModal from '../components/CreateGraphModal';
import Utils from "../helpers/Utils";

class GraphCompare extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  getGraph1Request = memoizeOne(async (graphId) => {
    if (+graphId) {
      const { payload: { data = {} } } = await this.props.getSingleGraphRequest(graphId);
      this.setState({ selectedNodes1: _.cloneDeep(data.graph?.nodes || []) });
    }
  })

  getGraph2Request = memoizeOne(async (graph2Id) => {
    if (+graph2Id) {
      const { data = {} } = await Api.getSingleGraph(graph2Id).catch((e) => e);
      this.setState({ singleGraph2: data.graph || {}, selectedNodes2: _.cloneDeep(data.graph?.nodes || []) });
    }
  })

  constructor(props) {
    super(props);
    this.state = {
      singleGraph2: {},
      selectedNodes1: [],
      selectedNodes2: [],
    };
  }

  async componentDidMount() {
    const { match: { params: { graphId, graph2Id } } } = this.props;
    this.props.setActiveButton('view');
    this.props.clearSingleGraph();
  }

  loadGraphs = async (s) => {
    const { match: { params: { graphId, graph2Id } } } = this.props;
    const { data } = await Api.getGraphsList(1, {
      s,
      onlyTitle: 1,
    });
    const graphs = data.graphs
      .filter((g) => +g.id !== +graphId && +g.id !== +graph2Id)
      .map((g) => ({
        value: g.id,
        label: `${g.title} (${g.nodesCount})`,
      }));
    return graphs;
  }

  handleGraphSelect = (val, graph) => {
    const {
      match: { params: { graphId, graph2Id } },
    } = this.props;
    const { value = 0 } = val;
    if (graph === 1) {
      this.props.history.replace(`/graphs/compare/${value}/${+graph2Id || 0}`);
    } else {
      this.props.history.replace(`/graphs/compare/${+graphId || 0}/${value}`);
    }
  }

  handleChange = (d, checked, pos) => {
    const key = pos === 1 ? 'selectedNodes1' : 'selectedNodes2';
    const data = this.state[key];
    const i = data.findIndex((n) => n.id === d.id);
    if (checked) {
      if (i === -1) {
        data.push(d);
      }
    } else if (i > -1) {
      data.splice(i, 1);
    }
    this.setState({ [key]: data });
  }

  createGraph = () => {
    const { singleGraph } = this.props;
    const { singleGraph2 } = this.state;
    const { selectedNodes1, selectedNodes2 } = this.state;

    let links = [...singleGraph.links || [], ...singleGraph2.links || []];
    let labels = new Set();
    const nodes = selectedNodes1.map((node1) => {
      const node2 = selectedNodes2.find((n) => n.name === node1.name);
      if (node2) {
        node1 = ChartUtils.merge(node2, node1);
        links = links.map((l) => {
          if (l.source === node2.id) {
            l.source = node1.id;
          }
          if (l.target === node2.id) {
            l.target = node1.id;
          }
          return l;
        });
      }

      delete node1.color;

      // singleGraph.labels.filter((l) => node1.labels?.includes(l.id) && l.type !== 'folder').forEach(labels.add, labels);
      return node1;
    });

    selectedNodes2.forEach((node2) => {
      const node1 = selectedNodes1.find((n) => n.name === node2.name);
      if (!node1) {
        // singleGraph.labels.filter((l) => node2.labels?.includes(l.id) && l.type !== 'folder').forEach(labels.add, labels);

        delete node2.color;

        nodes.push(node2);
      }
    });

    labels = [...labels];

    links = ChartUtils.uniqueLinks(links).map((l) => {
      delete l.color;
      return l;
    });

    const { customFields } = singleGraph;

    const customFieldsMerged = {};


    const customFieldsFull = Utils.mergeDeep(singleGraph2.customFields, customFields);
    console.log({
      a : singleGraph2.customFields, b: customFields,customFieldsFull
    })
    for (const type in customFieldsFull) {
      const customField = customFieldsFull[type];
      for (const tab in customField) {
        const { values } = customFieldsFull[type][tab];
        for (const nodeName in values) {
          const mainNode = nodes.find((n) => n.name === nodeName);
          if (mainNode) {
            const node1 = selectedNodes1.find((n) => n.name === nodeName);
            const node2 = selectedNodes2.find((n) => n.name === nodeName);
            console.log({
              customFields,
              b: singleGraph2.customFields,
              node1,
              node2,
            });
            const value1 = node1 ? _.get(customFields, [node1.type, tab, 'values', node1.id]) : undefined;
            const value2 = node2 ? _.get(singleGraph2.customFields, [node2.type, tab, 'values', node2.id]) : undefined;
            if (value1 && !value2) {
              _.set(customFieldsMerged, [mainNode.type, tab, 'values', mainNode.id], value1);
            } else if (!value1 && value2) {
              _.set(customFieldsMerged, [mainNode.type, tab, 'valuecs', mainNode.id], value2);
            } else if (value1 && value2 && value1 !== value2) {
              if (value1 !== value2) {
                _.set(customFieldsMerged, [mainNode.type, tab, 'values', mainNode.id], `${value1}\n<hr />\n${value2}`);
              } else {
                _.set(customFieldsMerged, [mainNode.type, tab, 'valuecs', mainNode.id], value2);
              }
            }
          }else {
            console.log('no name')
          }
        }
      }
    }

    console.log(customFieldsMerged);
    return;
    this.setState({
      createGraphData: {
        labels, nodes, links, customFields: customFieldsMerged,
      },
    });
  }

  renderSelectOption = (props) => {
    const {
      innerProps, children, getStyles, cx, ...params
    } = props;
    return (
      <div {...innerProps} className={cx(getStyles('option', params))}>{children}</div>
    );
  }

  render() {
    const {
      match: { params: { graphId, graph2Id } }, singleGraph,
    } = this.props;
    const {
      singleGraph2, selectedNodes1, selectedNodes2, createGraphData,
    } = this.state;
    this.getGraph1Request(graphId);
    this.getGraph2Request(graph2Id);
    const graph1Nodes = _.differenceBy(singleGraph.nodes, singleGraph2.nodes, 'name');
    const graph2Nodes = _.differenceBy(singleGraph2.nodes, singleGraph.nodes, 'name');

    const graph1CompareNodes = _.intersectionBy(singleGraph.nodes, singleGraph2.nodes, 'name');

    const selected = [...selectedNodes1, ...selectedNodes2];
    return (
      <Wrapper className="graphCompare" showFooter={false}>
        <Header />
        <div className="compareListWrapper">
          <ul className="compareList">
            <li className="item itemSearch">
              <div className="bottom">
                <div className="node node_left">
                  <Select
                    label="Graph 1"
                    isAsync
                    value={graphId && singleGraph.id ? [{
                      value: singleGraph.id,
                      label: `${singleGraph.title} (${singleGraph.nodes?.length})`,
                    }] : undefined}
                    onChange={(val) => this.handleGraphSelect(val, 1)}
                    loadOptions={this.loadGraphs}
                  />
                </div>
                <div className="node node_right">
                  <Select
                    label="Graph 2"
                    isAsync
                    value={graph2Id && singleGraph2.id ? [{
                      value: singleGraph2.id,
                      label: `${singleGraph2.title} (${singleGraph2.nodes?.length})`,
                    }] : undefined}
                    onChange={(val) => this.handleGraphSelect(val, 2)}
                    loadOptions={this.loadGraphs}
                  />
                </div>
              </div>

            </li>
          </ul>
          <GraphCompareList
            title={`Similar Nodes (${graph1CompareNodes.length}) `}
            singleGraph1={{ ...singleGraph, nodes: graph1CompareNodes }}
            singleGraph2={singleGraph2}
            onChange={this.handleChange}
            selected={selected}
          />
          <GraphCompareList
            title={(
              <span>
                {'Nodes in '}
                <strong>{singleGraph.title}</strong>
                {` (${graph1Nodes.length})`}
              </span>
            )}
            dropdown
            singleGraph1={{ ...singleGraph, nodes: graph1Nodes }}
            onChange={this.handleChange}
            selected={selected}
          />
          <GraphCompareList
            title={(
              <span>
                {'Nodes in '}
                <strong>{singleGraph2.title}</strong>
                {` (${graph2Nodes.length})`}
              </span>
            )}
            dropdown
            singleGraph2={{ ...singleGraph2, nodes: graph2Nodes }}
            onChange={this.handleChange}
            selected={selected}
          />
        </div>

        <Button onClick={this.createGraph} className="compareAndCreateNewGraph" color="main" icon="fa-plus">
          Create New Graph
        </Button>

        {!_.isEmpty(createGraphData) ? (
          <CreateGraphModal show data={createGraphData} />
        ) : null}
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  userGraphs: state.shareGraphs.userGraphs,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  userGraphRequest,
  clearSingleGraph,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphCompare);

export default Container;
