import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import Chart from '../../Chart';
import NodeIcon from '../NodeIcon';

class ConnectionDetails extends Component {
  getGroupedConnections = memoizeOne((nodeName) => {
    const nodeLinks = Chart.getNodeLinks(nodeName, 'all');
    const nodes = Chart.getNodes();
    const connectedNodes = nodeLinks.map((l) => {
      let connected;
      if (l.source === nodeName) {
        connected = nodes.find((d) => d.name === l.target);
      } else {
        connected = nodes.find((d) => d.name === l.source);
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
    const { nodeName, exportNode, ConnectionNodes } = this.props;
    const queryObj = queryString.parse(window.location.search);
    const connectedNodes = this.getGroupedConnections(nodeName);

    if (exportNode) {
      connectedNodes.map((nodeGroup) => {
        nodeGroup.map((d) => {
          if (d.connected.icon && d.connected.icon.startsWith('blob')) {
            d.connected.icon = ConnectionNodes.find((node) => node.name === d.connected.name).icon;
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
                <li className="item" key={d.connected.name}>
                  {exportNode === false
                    ? (
                      <Link replace to={`?${queryString.stringify({ ...queryObj, info: d.connected.name })}`}>
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
