import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class File extends Component {
  static propTypes = {
    onChangeFile: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    multiple: PropTypes.bool,
    label: PropTypes.string,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    id: PropTypes.string,
  }

  static defaultProps = {
    label: undefined,
    containerId: undefined,
    onChange: undefined,
    id: undefined,
    containerClassName: '',
    multiple: false,
  }


  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
  }


  handleChange = (ev) => {
    const { files } = ev.target;
    const { multiple } = this.props;
    if (this.props.onChangeFile) {
      this.props.onChangeFile(multiple ? files : files[0]);
    }
    if (this.props.onChange) {
      this.props.onChange(ev);
    }
  }


  render() {
    const {
      id, containerId, label, containerClassName, onChangeFile, ...props
    } = this.props;
    const inputId = id || `file_${this.id}`;
    console.log(props)
    return (
      <div
        id={containerId}
        className={classNames(containerClassName, 'ghFormField', 'ghFile')}
      >
        {label ? (
          <span className="label">{label}</span>
        ) : null}
        <label htmlFor={inputId}>Select</label>
        <input {...props} id={inputId} type="file" onChange={this.handleChange} />
      </div>
    );
  }
}

export default File;
