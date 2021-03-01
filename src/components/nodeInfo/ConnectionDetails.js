import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import Chart from '../../Chart';
import NodeIcon from '../NodeIcon';

class ConnectionDetails extends Component {
  getGroupedConnections = memoizeOne((nodeId) => {
    const nodeLinks = Chart.getNodeLinks(nodeId, 'all');
    const nodes = Chart.getNodes();
    const connectedNodes = nodeLinks.map((l) => {
      let connected;
      if (l.source === nodeId) {
        connected = nodes.find((d) => d.id === l.target);
      } else {
        connected = nodes.find((d) => d.id === l.source);
      }
      return {
        linkType: l.type,
        connected,
      };
    });

    const connectedNodesGroup = Object.values(_.groupBy(connectedNodes, 'linkType'));
    return _.orderBy(connectedNodesGroup, (d) => d.length, 'desc');
  })

  render() {
    const { nodeId, exportNode, nodeData } = this.props;
    const queryObj = queryString.parse(window.location.search);
    const connectedNodes = this.getGroupedConnections(nodeId);
    if (exportNode) {
      connectedNodes.map((nodeGroup) => {
        nodeGroup.map((d) => {
          if (d.connected.icon && d.connected.icon.startsWith('blob')) {
            d.connected.icon = nodeData.find((node) => node.id === d.connected.id).icon;
          }
        });
      });
    }

    return (
      <div className="connectionDetails">
        {connectedNodes.map((nodeGroup) => (
          <div className="row" key={nodeGroup[0].linkType}>
            <h3>{`${nodeGroup[0].linkType} (${nodeGroup.length})`}</h3>
            <ul className="list">
              {nodeGroup.map((d) => (
                <li className="item" key={d.connected.id}>
                  {exportNode == undefined || exportNode === false
                    ? (
                      <Link replace to={`?${queryString.stringify({ ...queryObj, info: d.connected.id })}`}>
                        <div className="left">
                          <NodeIcon node={d.connected} />
                        </div>
                        <div className="right">
                          <span className="name">{d.connected.name}</span>
                          <span className="type">{d.connected.type}</span>
                        </div>
                      </Link>
                    )
                    : (
                      <a href="#">
                        <div className="left">
                          <NodeIcon node={d.connected} />
                        </div>
                        <div className="right">
                          <span className="name">{d.connected.name}</span>
                          <span className="type">{d.connected.type}</span>
                        </div>
                      </a>
                    )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

export default ConnectionDetails;
