import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSelect from 'react-select';
import ReactSelectCreatable from 'react-select/creatable';
import Icon from './Icon';

class Select extends Component {
  static propTypes = {
    id: PropTypes.string,
    onChange: PropTypes.func,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    children: PropTypes.node,
    icon: PropTypes.any,
    isClearable: PropTypes.bool,
  }

  static defaultProps = {
    id: undefined,
    onChange: undefined,
    containerClassName: '',
    containerId: undefined,
    label: undefined,
    children: undefined,
    error: undefined,
    icon: undefined,
    isClearable: false,
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
      error, icon, ...props
    } = this.props;
    const inputId = id || `select_${this.id}`;
    return (
      <div
        id={containerId}
        className={classNames(containerClassName, 'ghFormField', 'ghSelect')}
      >
        {label ? (
          <label htmlFor={inputId}>{label}</label>
        ) : null}
        <Icon value={icon} />
        {props.isClearable ? (
          <ReactSelectCreatable
            {...props}
            id={inputId}
            classNamePrefix="gh"
            className={classNames('ghSelectContent', props.className)}
          />
        ) : (
          <ReactSelect
            {...props}
            id={inputId}
            classNamePrefix="gh"
            className={classNames('ghSelectContent', props.className)}
          />
        )}
        {error ? (
          <div className="error">{error}</div>
        ) : null}
        {children}
      </div>
    );
  }
}

export default Select;
