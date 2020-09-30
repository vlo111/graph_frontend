import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';

class Input extends Component {
  static propTypes = {
    id: PropTypes.string,
    onChangeText: PropTypes.func,
    onChange: PropTypes.func,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    children: PropTypes.node,
    icon: PropTypes.any,
    textArea: PropTypes.bool,
    limit: PropTypes.number,
    onRef: PropTypes.func,
  }

  static defaultProps = {
    id: undefined,
    onChangeText: undefined,
    onChange: undefined,
    containerClassName: '',
    containerId: undefined,
    label: undefined,
    children: undefined,
    error: undefined,
    icon: undefined,
    textArea: false,
    limit: undefined,
    onRef: undefined,
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
  }

  handleChange = (ev) => {
    const { onChangeText, onChange, limit } = this.props;
    if (limit && ev.target.value.length > limit) {
      ev.target.value = ev.target.value.substr(0, limit);
    }
    if (onChange) onChange(ev);

    if (onChangeText) onChangeText(ev.target.value, ev.target.name);
  }

  render() {
    const {
      id, label, containerClassName, containerId, children,
      textArea, limit, onRef,
      error, onChangeText, icon, ...props
    } = this.props;
    const inputId = id || `input_${this.id}`;
    return (
      <div
        id={containerId}
        className={classNames(containerClassName, 'ghFormField', 'ghInput')}
      >
        {label ? (
          <label htmlFor={inputId}>{label}</label>
        ) : null}
        <Icon value={icon} />
        {textArea ? (
          <textarea ref={(ref) => onRef && onRef(ref)} {...props} id={inputId} onChange={this.handleChange} />
        ) : (
          <input ref={(ref) => onRef && onRef(ref)} {...props} id={inputId} onChange={this.handleChange} />
        )}
        {!error && limit ? (
          <div className="limit">{`${limit - (props.value || '').length} / ${limit} characters`}</div>
        ) : null}
        {children}
        {error ? (
          <div className="error">{error}</div>
        ) : null}
      </div>
    );
  }
}

export default Input;
