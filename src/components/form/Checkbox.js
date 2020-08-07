import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

class Checkbox extends Component {
  static propTypes = {
    id: PropTypes.string,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    children: PropTypes.node,
    labelReverse: PropTypes.bool,
  }

  static defaultProps = {
    id: undefined,
    containerClassName: '',
    containerId: undefined,
    label: undefined,
    children: undefined,
    error: undefined,
    labelReverse: undefined,
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
  }

  render() {
    const {
      id, label, containerClassName, containerId, children,
      error, labelReverse, ...props
    } = this.props;
    const inputId = id || `checkbox_${this.id}`;
    return (
      <div
        id={containerId}
        className={classNames(containerClassName, 'ghFormField', 'ghCheckbox', { labelReverse })}
      >
        <input {...props} id={inputId} type="checkbox" />
        {label ? (
          <label htmlFor={inputId}>{label}</label>
        ) : null}
        {children}
        {error ? (
          <div className="error">{error}</div>
        ) : null}
      </div>
    );
  }
}

export default Checkbox;
