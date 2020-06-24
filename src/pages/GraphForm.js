import React, { Component } from 'react';
import { connect } from 'react-redux';
import Wrapper from '../components/Wrapper';
import ToolBar from '../components/ToolBar';
import GraphHeader from '../components/GraphHeader';
import ReactChart from '../components/chart/ReactChart';
import AddNodeModal from '../components/chart/AddNodeModal';
import Crop from '../components/chart/Crop';
import ContextMenu from '../components/ContextMenu';
import DataView from '../components/dataView/DataView';
import DataImport from '../components/DataImport';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from "../store/actions/app";
import { getSingleGraphRequest } from "../store/actions/graphs";

class GraphForm extends Component {
  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('create');
    this.props.getSingleGraphRequest(graphId);
  }

  render() {
    const { activeButton } = this.props;
    return (
      <Wrapper showHeader={false} showFooter={false}>
        <GraphHeader />
        <ToolBar />
        <div className="graphWrapper">
          {activeButton === 'data' ? <DataView /> : null}
          <ReactChart />
        </div>
        <Crop />
        <AddNodeModal />
        <ContextMenu />
        <DataImport />
        <NodeDescription />
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
)(GraphForm);

export default Container;
