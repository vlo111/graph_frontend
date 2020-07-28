import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';

class Button extends Component {
  static propTypes = {
    icon: PropTypes.any,
    children: PropTypes.any,
    className: PropTypes.string,
    type: PropTypes.string,
    onClick: PropTypes.func,
    orange: PropTypes.bool,
    light: PropTypes.bool,
    transparent: PropTypes.bool,
    color: PropTypes.oneOf('main', 'blue', 'orange', 'transparent', 'light'),
  }

  static defaultProps = {
    icon: undefined,
    onClick: undefined,
    orange: false,
    transparent: false,
    light: false,
    children: '',
    type: 'button',
    className: '',
    color: 'main'
  }

  render() {
    const {
      icon, children, className, loading, color, ...props
    } = this.props;
    return (
      <button className={classNames('ghButton', className, color, { alt: color !== 'main' })} {...props}>
        <Icon value={icon} />
        {children}
      </button>
    );
  }
}

export default Button;
