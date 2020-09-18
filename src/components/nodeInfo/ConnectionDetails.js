import React, { Component } from 'react';
import NodeIcon from "../NodeIcon";
import memoizeOne from "memoize-one";
import Chart from "../../Chart";
import _ from "lodash";
import { Link } from 'react-router-dom';

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
    const { nodeName } = this.props;
    const connectedNodes = this.getGroupedConnections(nodeName);
    return (
      <div className="connectionDetails">
        {connectedNodes.map((nodeGroup) => (
          <div className="row">
            <h3>{`${nodeGroup[0].linkType} (${nodeGroup.length})`}</h3>
            <ul className="list">
              {nodeGroup.map((d) => (
                <li className="item">
                  <Link replace to={`?info=${d.connected.name}`}>
                    <div className="left">
                      <NodeIcon node={d.connected} />
                    </div>
                    <div className="right">
                      <span className="name">{d.connected.name}</span>
                      <span className="type">{d.connected.type}</span>
                    </div>
                  </Link>
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
