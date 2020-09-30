import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import File from '../form/File';
import Button from '../form/Button';
import Utils from '../../helpers/Utils';
import { convertGraphRequest } from '../../store/actions/graphs';
import Chart from '../../Chart';
import ImportStep2 from './ImportStep2';

class DataImportModal extends Component {
  static propTypes = {
    convertGraphRequest: PropTypes.func.isRequired,
    importData: PropTypes.object.isRequired,
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

  render() {
    const { fileType, step, loading } = this.state;
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
      <>
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
        {step === 2 ? <ImportStep2 /> : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  importData: state.graphs.importData,
});
const mapDispatchToProps = {
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataImportModal);

export default Container;
