import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { setActiveButton } from '../store/actions/app';
import File from './form/File';
import Button from './form/Button';
import Utils from '../helpers/Utils';
import { convertGraphRequest } from '../store/actions/graphs';
import Chart from '../Chart';

class DataImport extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    convertGraphRequest: PropTypes.func.isRequired,
    importData: PropTypes.object.isRequired,
    activeButton: PropTypes.string.isRequired,
  }

  // eslint-disable-next-line no-unused-vars
  resetStep = memoizeOne((reset) => {
    this.setState({ step: 1 });
  })

  constructor(props) {
    super(props);
    this.state = {
      fileType: '',
      step: 1,
      loading: false,
      requestData: [],
    };
  }

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  handleChange = async (path, file) => {
    const { requestData } = this.state;
    let { fileType } = this.state;
    _.set(requestData, path, file);

    const firstFile = requestData.file || {};
    if (path === 'file') {
      if (firstFile.type === 'text/csv') {
        const data = await Utils.fileToString(file);
        if (data.includes('"Name","Description","Icon",')) {
          fileType = 'nodes';
        } else {
          fileType = 'links';
        }
      } else {
        fileType = firstFile.type;
      }
    }
    this.setState({ requestData, fileType });
  }

  convert = async () => {
    const { requestData } = this.state;
    const { file } = requestData;
    toast.dismiss(this.toast);
    if (!file) {
      this.toast = toast.warn('Please Select File');
      return;
    }
    let convertType = 'xlsx';
    if (file.type === 'text/csv') {
      convertType = 'csv';
    } else if (file.type === 'application/zip') {
      convertType = 'csv-zip';
    }
    this.setState({ loading: true });
    const { payload: { data } } = await this.props.convertGraphRequest(convertType, requestData);
    if (data.nodes?.length) {
      this.setState({ loading: false, step: 2 });
    } else {
      this.toast = toast.error('Invalid File');
      this.setState({ loading: false });
    }
  }

  import = () => {
    const { importData: { nodes = [], links = [] } } = this.props;
    Chart.render({ nodes, links });
    this.closeModal();
  }

  render() {
    const { activeButton, importData } = this.props;
    const { fileType, step, loading } = this.state;
    this.resetStep(activeButton === 'import');
    let file1Label = 'Select File';
    let file2Label = 'Select File';
    if (fileType === 'nodes') {
      file1Label = 'Select File (nodes)';
      file2Label = 'Select File (links)';
    } else if (fileType === 'links') {
      file1Label = 'Select File (links)';
      file2Label = 'Select File (nodes)';
    }
    return (
      <Modal
        isOpen={activeButton === 'import'}
        className="ghModal ghImportModal"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        {step === 1 ? (
          <>
            <File
              onChangeFile={(file) => this.handleChange('file', file)}
              accept=".xlsx"
              label={file1Label}
            />
            {['nodes', 'links'].includes(fileType) ? (
              <File
                onChangeFile={(file) => this.handleChange('file_2', file)}
                accept=".csv"
                label={file2Label}
              />
            ) : null}
            <Button onClick={this.convert} loading={loading}>Next</Button>
          </>
        ) : null}
        {step === 2 ? (
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
            <Button onClick={this.import} loading={loading}>Import</Button>
          </>
        ) : null}

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  importData: state.graphs.importData,
});
const mapDespatchToProps = {
  setActiveButton,
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(DataImport);

export default Container;
