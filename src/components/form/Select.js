import React, { Component } from 'react';
import ReactDOM from 'react-dom';
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
    portal: PropTypes.bool,
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
    portal: false,
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
  }

  renderMenu = (props) => {
    if (!this.menuOrientation) {
      return null;
    }
    const {
      children, className, cx, innerRef, innerProps,
    } = props;
    const { left, top, width } = this.menuOrientation.getBoundingClientRect();
    return ReactDOM.createPortal((
      <div
        style={{ left, top, width }}
        className={cx({ menu: true, selectPortal: true }, className)}
        {...innerProps}
        ref={innerRef}
      >
        {children}
      </div>
    ), document.body);
  }

  render() {
    const {
      id, label, containerClassName, containerId, children,
      error, icon, portal, ...props
    } = this.props;
    const inputId = id || `select_${this.id}`;
    const components = {};
    if (portal) {
      components.Menu = this.renderMenu;
    }
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
            components={components}
            onInputChange={(value) => {
              this.inputValue = value;
            }}
            onBlur={() => {
              if (this.inputValue && props.value[0]?.value !== this.inputValue) {
                this.props.onChange({ value: this.inputValue, label: this.inputValue });
              }
            }}
            className={classNames('ghSelectContent', props.className)}
          />
        ) : (
          <ReactSelect
            {...props}
            id={inputId}
            classNamePrefix="gh"
            components={components}
            className={classNames('ghSelectContent', props.className)}
          />
        )}
        {portal ? (
          <div className="menuOrientation" ref={(ref) => this.menuOrientation = ref} />
        ) : null}
        {error ? (
          <div className="error">{error}</div>
        ) : null}
        {children}
      </div>
    );
  }
}

export default Select;
