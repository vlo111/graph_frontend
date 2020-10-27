import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ToolBar from '../components/ToolBar';
import ReactChart from '../components/chart/ReactChart';
import AddNodeModal from '../components/chart/AddNodeModal';
import Crop from '../components/chart/Crop';
import ContextMenu from '../components/contextMenu/ContextMenu';
import DataView from '../components/dataView/DataView';
import DataImport from '../components/import/DataImportModal';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from '../store/actions/app';
import { clearSingleGraph, getSingleGraphRequest } from '../store/actions/graphs';
import AddLinkModal from '../components/chart/AddLinkModal';
import Zoom from '../components/Zoom';
import AccountDropDown from '../components/account/AccountDropDown';
import SearchModal from '../components/search/SearchModal';
import AutoPlay from '../components/AutoPlay';
import MapsButton from '../components/maps/MapsButton';
import MapsGraph from '../components/maps/MapsGraph';
import NodeFullInfo from '../components/nodeInfo/NodeFullInfo';
import AddLabelModal from '../components/chart/AddLabelModal';
import LabelTooltip from '../components/LabelTooltip';
import Legend from '../components/Legend';
import CreateGraphModal from "../components/CreateGraphModal";

class GraphForm extends Component {
  static propTypes = {
    getSingleGraphRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    clearSingleGraph: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('create');
    if (+graphId) {
      this.props.getSingleGraphRequest(graphId);
    } else {
      this.props.clearSingleGraph();
    }
  }

  render() {
    const { activeButton } = this.props;
    return (
      <Wrapper className="graphsPage" showHeader={false} showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        <ToolBar />
        <AccountDropDown />
        <Crop />
        <AddNodeModal />
        {activeButton === 'data' && <DataView />}
        {activeButton === 'search' && <SearchModal />}
        {activeButton === 'maps-view' && <MapsGraph />}
        <AddLinkModal />
        <AddLabelModal />
        <ContextMenu />
        <DataImport />
        <NodeDescription />
        <NodeFullInfo />
        <AutoPlay />
        <Zoom />
        <MapsButton />
        <Legend />
        <LabelTooltip />
        <CreateGraphModal />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  clearSingleGraph,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphForm);

export default Container;
