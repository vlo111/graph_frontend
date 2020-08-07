import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from '../store/actions/app';
import { getSingleGraphRequest } from '../store/actions/graphs';
import Button from '../components/form/Button';
import GraphHeader from "../components/GraphHeader";

class GraphView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('view');
    this.props.getSingleGraphRequest(graphId);
  }

  render() {
    const { singleGraph, location: { pathname } } = this.props;
    const preview = pathname.startsWith('/graphs/preview/');
    return (
      <Wrapper className="graphView" showHeader={!preview} showFooter={false}>
        <GraphHeader />
        <div className="graphWrapper">
          <ReactChart />
        </div>
        {preview ? (
          <div className="graphPreview">
            <h1 className="title">{singleGraph.title}</h1>
            <p className="description">
              {singleGraph.description}
            </p>
            <div>
              <strong>{'Nodes: '}</strong>
              {singleGraph.nodes?.length}
            </div>
            <div>
              <strong>{'Links: '}</strong>
              {singleGraph.links?.length}
            </div>
            <Link className="ghButton view" to={`/graphs/view/${singleGraph.id}`} replace>
              View Graph
            </Link>
          </div>
        ) : (
          <>
            <Link to={`/graphs/update/${singleGraph.id}`}>
              <Button icon="fa-pencil" className="transparent edit" />
            </Link>
            <NodeDescription />
          </>
        )}
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
});
const mapDespatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(GraphView);

export default Container;
