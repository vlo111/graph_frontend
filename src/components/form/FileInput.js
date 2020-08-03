import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Input from './Input';
import Icon from './Icon';
import Utils from '../../helpers/Utils';

class FileInput extends Component {
  static propTypes = {
    onChangeFile: PropTypes.func.isRequired,
    accept: PropTypes.string,
    selectLabel: PropTypes.string,
    value: PropTypes.string,
  }

  static defaultProps = {
    accept: undefined,
    selectLabel: 'Select File',
    value: undefined,
  }

  static blobs = {};

  constructor(props) {
    super(props);
    this.state = {
      file: {},
    };
  }

  handleFileSelect = (ev) => {
    const file = ev.target.files[0] || {};
    this.setState({ file });
    const url = Utils.fileToBlob(file);
    this.constructor.blobs[url] = file.name;
    this.props.onChangeFile(url, file);
  }

  handleTextChange = (name) => {
    this.props.onChangeFile(name, {
      name,
    });
  }

  clearFile = () => {
    this.setState({ file: {} });
    this.props.onChangeFile('', {
      name: '',
    });
  }

  render() {
    const { file } = this.state;
    const { accept, selectLabel, onChangeFile, ...props } = this.props;
    let value = props.value || file.name || '';
    let localFile = file instanceof File;
    if (_.isObject(value) && 'name' in value) {
      value = value.name;
    } else if (value.toString().startsWith('blob:')) {
      localFile = true;
      value = this.constructor.blobs[value] || 'Selected';
    }
    return (
      <div className="ghFileInput">
        <Input {...props} value={value} disabled={localFile} onChangeText={this.handleTextChange} />
        <div className="buttons">
          {localFile ? (
            <Icon value="fa-close" className="clear" onClick={this.clearFile} />
          ) : null}
          <label className="fileLabel ghButton">
            {selectLabel}
            <input type="file" accept={accept} onChange={this.handleFileSelect} />
          </label>
        </div>
      </div>
    );
  }
}

export default FileInput;
