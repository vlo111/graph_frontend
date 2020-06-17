import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

class Icon extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    className: PropTypes.string,
  }

  static defaultProps = {
    value: null,
    className: '',
  }

  render() {
    const { value, className, ...props } = this.props;
    if (!value) {
      return null;
    }
    return (
      <span className={`icon ${className}`} {...props}>
        {_.isString(value) ? (<span className={`icon fa ${value}`} />) : null}
        {_.isObjectLike(value) ? value : null}
      </span>
    );
  }
}

export default Icon;
