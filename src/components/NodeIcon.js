import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChartUtils from '../helpers/ChartUtils';

class NodeIcon extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
  }

  render() {
    const { node } = this.props;
    return (
      <span
        className={`nodeIcon ${node.nodeType} ${node.icon ? 'hasImage' : ''}`}
        style={{ background: !node.icon ? ChartUtils.nodeColor()(node) : undefined }}
      >
        {node.icon ? (
          <img src={node.icon} alt="icon" width={50} height={50} />
        ) : (
          <span className="text">{node.type[0]}</span>
        )}
      </span>
    );
  }
}

export default NodeIcon;
