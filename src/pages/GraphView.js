import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from '../store/actions/app';
import { getSingleGraphRequest } from '../store/actions/graphs';
import Button from "../components/form/Button";
import { Link } from "react-router-dom";

class GraphView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      preview: true,
    }
  }


  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('view');
    this.props.getSingleGraphRequest(graphId);
  }

  viwGraph = () => {
    this.setState({ preview: false });
  }

  render() {
    const { singleGraph } = this.props;
    const { preview } = this.state;
    return (
      <Wrapper className="graphView" showHeader={!preview} showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        {preview ? (
          <div className="graphPreview">
            <h1 className="title">{singleGraph.title}</h1>
            <p className="description">
              {singleGraph.description}
            </p>
            <Button className="white view" onClick={this.viwGraph}>
              View Graph
            </Button>
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
