import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from '../store/actions/app';
import { getSingleGraphRequest } from '../store/actions/graphs';
import Button from "../components/form/Button";

class GraphView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
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
    const { preview } = this.state;
    return (
      <Wrapper showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        {preview ? (
          <div className="graphPreview">
            <h1 className="title">Hello</h1>
            <p className="description">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium alias
              aut blanditiis cum debitis ea, ex id laborum minima minus modi necessitatibus nulla numquam provident quae
              quaerat rem sed.
            </p>
            <Button className="white" onClick={this.viwGraph}>
              View Graph
            </Button>
          </div>
        ) : (
          <NodeDescription />
        )}
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
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
