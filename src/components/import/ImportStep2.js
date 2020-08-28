import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton } from '../../store/actions/app';
import { convertGraphRequest } from '../../store/actions/graphs';
import ChartUtils from "../../helpers/ChartUtils";

class ImportStep2 extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    importData: PropTypes.object.isRequired,
  }

  import = () => {
    const { importData: { nodes = [], links = [] } } = this.props;
    ChartUtils.resetColors();
    Chart.render({ nodes, links });
    this.props.setActiveButton('create');
  }

  render() {
    const { importData } = this.props;
    return (
      <>
        <div>
          <strong>Nodes: </strong>
          {importData.nodes?.length || 0}
        </div>
        <div>
          <strong>Links: </strong>
          {importData.links?.length || 0}
        </div>
        {importData.warnings?.length ? (
          <div>
            <span>Warnings: </span>
            {importData.warnings?.length}
          </div>
        ) : null}
        <Button onClick={this.import}>Import</Button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  importData: state.graphs.importData,
});

const mapDispatchToProps = {
  setActiveButton,
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportStep2);

export default Container;
