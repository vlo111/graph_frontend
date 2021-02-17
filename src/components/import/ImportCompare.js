import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import GraphCompareList from '../graphCompare/GraphCompareList';
import { setActiveButton } from '../../store/actions/app';
import { clearSingleGraph, getSingleGraphRequest } from '../../store/actions/graphs';
import { userGraphRequest } from '../../store/actions/shareGraphs';

class ImportCompare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedNodes1: [],
      selectedNodes2: [],
    };
  }

  render() {
    const { selectedNodes1, selectedNodes2 } = this.state;
    const { importData: singleGraph2, singleGraph } = this.props;
    const graph1CompareNodes = _.intersectionBy(singleGraph.nodes, singleGraph2.nodes, 'name');
    const selected = [...selectedNodes1, ...selectedNodes2];
    const graph1Nodes = _.differenceBy(singleGraph.nodes, singleGraph2.nodes, 'name');
    const graph2Nodes = _.differenceBy(singleGraph2.nodes, singleGraph.nodes, 'name');

    return (
      <div className="compareWrapper">
        <GraphCompareList
          title={`Similar Nodes (${graph1CompareNodes.length}) `}
          singleGraph1={{ ...singleGraph, nodes: graph1CompareNodes }}
          singleGraph2={singleGraph2}
          onChange={this.handleChange}
          selected={selected}
        />
        <GraphCompareList
          title={2}
          dropdown
          singleGraph1={{ ...singleGraph, nodes: graph1Nodes }}
          onChange={this.handleChange}
          selected={selected}
        />
        <GraphCompareList
          title={1}
          dropdown
          singleGraph2={{ ...singleGraph2, nodes: graph2Nodes }}
          onChange={this.handleChange}
          selected={selected}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportCompare);

export default Container;
