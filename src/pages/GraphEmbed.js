import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import { getSingleEmbedGraphRequest } from '../store/actions/graphs';
import NodeFullInfo from '../components/nodeInfo/NodeFullInfo';
import LabelTooltip from '../components/LabelTooltip';
import Legend from '../components/Legend';
import { setActiveButton } from '../store/actions/app';

class GraphEmbed extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    getSingleEmbedGraphRequest: PropTypes.func.isRequired,
  }

  async componentDidMount() {
    const { match: { params: { graphId, token } } } = this.props;
    this.props.setActiveButton('view');
    const { payload } = await this.props.getSingleEmbedGraphRequest(graphId, token);
    if (payload?.status === 404) {
      this.props.history.push('/404');
    }
  }

  render() {
    return (
      <Wrapper auth={false} className="graphView" showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        <Legend />
        <NodeFullInfo editable={false} />
        <LabelTooltip />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  getSingleEmbedGraphRequest,
  setActiveButton,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphEmbed);

export default Container;
