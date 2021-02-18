import React, { Component } from 'react';
import PropTypes from 'prop-types';
import stripHtml  from 'string-strip-html';
import Button from './form/Button';

class TextEllipsis extends Component {
  static propTypes = {
    maxLength: PropTypes.number.isRequired,
    component: PropTypes.any,
    children: PropTypes.string,
    more: PropTypes.string,
    less: PropTypes.string,
    className: PropTypes.string,
  }

  static defaultProps = {
    children: '',
    className: '',
    more: 'show more',
    less: 'show less',
    component: 'div',
  }

  constructor(props) {
    super(props);
    this.state = {
      full: false,
    };
  }

  toggleFull = () => {
    const { full } = this.state;
    this.setState({ full: !full });
  }

  render() {
    const { full } = this.state;
    const {
      maxLength, component: C, children, more, less, className, ...props
    } = this.props;
    const { result: childrenEscape } = stripHtml(children);
    return (
      <C {...props} className={`textEllipsis ${className}`}>
        {childrenEscape < maxLength || full ? (
          <>
            <span dangerouslySetInnerHTML={{ __html: children }} />
            {full ? (
              <Button color="transparent" onClick={this.toggleFull}>{less}</Button>
            ) : null}
          </>
        ) : (
          <>
            <span>
              {childrenEscape.length > maxLength ? `${childrenEscape.substr(0, maxLength)}... ` : childrenEscape}
            </span>
            <Button color="transparent" onClick={this.toggleFull}>{more}</Button>
          </>
        )}
      </C>
    );
  }
}

export default TextEllipsis;
