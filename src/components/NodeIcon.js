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
    return (
      <span
        className={`nodeIcon ${node.nodeType} ${node.icon ? 'hasImage' : ''}`}
        style={{ background: !node.icon ? ChartUtils.nodeColor(node) : undefined }}
      >
        {node.icon && !error ? (
          <img src={node.icon} onError={this.handleError} alt="icon" width={50} height={50} />
        ) : (
          <span className="text">{node.type[0]}</span>
        )}
      </span>
    );
  }
}

export default NodeIcon;
