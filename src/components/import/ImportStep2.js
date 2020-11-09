import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton } from '../../store/actions/app';
import {
  convertGraphRequest,
  setGraphCustomFields,
  updateSingleGraph
} from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';

class ImportStep2 extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGraphCustomFields: PropTypes.func.isRequired,
    updateSingleGraph: PropTypes.func.isRequired,
    importData: PropTypes.object.isRequired,
  }

  import = async () => {
    const {
      importData: {
        nodes = [], links = [], labels = [], customFields = {},
      },
    } = this.props;
    ChartUtils.resetColors();
    this.props.updateSingleGraph({
      nodes,
      links,
      labels,
      embedLabels: [],
    });

    Chart.render({
      nodes, links, labels, embedLabels: [],
    });
    this.props.setGraphCustomFields(customFields);
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
  setGraphCustomFields,
  updateSingleGraph
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportStep2);

export default Container;
