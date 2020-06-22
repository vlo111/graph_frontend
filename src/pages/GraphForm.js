import React, { Component } from 'react';
import { connect } from 'react-redux';
import Wrapper from '../components/Wrapper';
import ToolBar from '../components/ToolBar';
import Header from '../components/Header';
import ReactChart from '../components/chart/ReactChart';
import AddNodeModal from '../components/chart/AddNodeModal';
import Crop from '../components/chart/Crop';
import ContextMenu from '../components/ContextMenu';
import DataView from '../components/dataView/DataView';
import DataImport from '../components/DataImport';

class GraphForm extends Component {
  render() {
    const { activeButton } = this.props;
    return (
      <Wrapper>
        <Header />
        <ToolBar />
        <div className="graphWrapper">
          {activeButton === 'data' ? <DataView /> : null}
          <ReactChart />
        </div>
        <Crop />
        <AddNodeModal />
        <ContextMenu />
        <DataImport />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDespatchToProps = {};
const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(GraphForm);

export default Container;
