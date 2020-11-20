import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton, setGridIndexes } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import { createGraphRequest } from '../../store/actions/graphs';

class NodeFullInfoContext extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    createGraphRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
  }

  crop = () => {
    const { params: { squareDara } } = this.props;
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    nodes = nodes.filter((d) => squareDara.nodes.includes(d.id));
    this.props.setGridIndexes('nodes', nodes.map((d) => d.index));

    links = links.filter((d) => squareDara.nodes.includes(d.target) && squareDara.nodes.includes(d.source));
    this.props.setGridIndexes('links', links.map((d) => d.index));
    this.props.setActiveButton('data');
  }

  createNewGraph = async () => {
    const { singleGraph, params: { squareDara } } = this.props;
    let links = Chart.getLinks();
    let labels = Chart.getLabels();
    let { nodes, files, customFields } = await ChartUtils.getNodesWithFiles(this.props.customFields);

    nodes = nodes.filter((d) => squareDara.nodes.includes(d.id));
    labels = labels.filter((l) => squareDara.labels.includes(l.id));
    links = links.filter((l) => squareDara.nodes.includes(l.source) && squareDara.nodes.includes(l.target));

    const { payload: { data } } = await this.props.createGraphRequest({
      ...singleGraph,
      nodes,
      links,
      labels,
      files,
      customFields,
    });
    if (data.graphId) {
      window.location.href = `/graphs/update/${data.graphId}`;
    } else {
      toast.error('Something went wrong');
    }
  }

  render() {
    const { params } = this.props;
    return (
      <>
        <Button
          icon="fa-plus-circle"
          onClick={this.createNewGraph}
        >
          New Graph
        </Button>
        <Button
          icon="fa-crop"
          onClick={this.crop}
        >
          Crop
        </Button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  createGraphRequest,
  setGridIndexes,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeFullInfoContext);

export default withRouter(Container);
