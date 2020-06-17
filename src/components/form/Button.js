import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

class Button extends Component {
  static propTypes = {
    icon: PropTypes.any,
    children: PropTypes.any,
    className: PropTypes.string,
    type: PropTypes.string,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    icon: undefined,
    onClick: undefined,
    children: '',
    type: 'button',
    className: '',
  }

  render() {
    const {
      icon, children, className, loading, ...props
    } = this.props;
    return (
      <button className={`ghButton ${className}`} {...props}>
        <Icon value={icon} />
        {children}
      </button>
    );
  }
}

export default Button;
