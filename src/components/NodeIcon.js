import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChartUtils from '../helpers/ChartUtils';

class NodeIcon extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      error: false,
    }
  }

  handleError = () => {
    this.setState({ error: true });
  }

  render() {
    const { error } = this.state;
    const { node } = this.props;
    const showIcon = node.icon && !error;

    return (
      <span
        className={`nodeIcon ${node.nodeType} ${showIcon ? 'hasImage' : ''}`}
        style={{ background: !showIcon ? ChartUtils.nodeColor(node) : undefined }}
      >
        {showIcon ? (
          <img src={node.icon} onError={this.handleError} alt="icon" width={50} height={50} />
        ) : (
          <span className="text">{node.type[0]}</span>
        )}
      </span>
    );
  }
}

export default NodeIcon;
