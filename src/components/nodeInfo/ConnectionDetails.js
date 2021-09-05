import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import Chart from '../../Chart';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';

class ConnectionDetails extends Component {
  getGroupedConnections = memoizeOne((nodeId) => {
    const { links, nodes } = this.props;

    const nodeLinks = links.filter((d) => (d.source === nodeId || d.target === nodeId));

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
    return { connectedNodes: _.orderBy(connectedNodesGroup, (d) => d.length, 'desc'), length: connectedNodes.length };
  })

  openFolder = (e, d) => {
    const label = this.props.labels.filter((p) => p.id === d.connected.labels[0])[0];

    if (label) {
      Chart.event.emit('folder.open', e, label);

      const lbs = Chart.getLabels().map((lb) => {
        if (lb.id === label.id) {
          lb.open = true;
        }
        return lb;
      });

      Chart.render({ labels: lbs });

      setTimeout(() => {
        const nodes = Chart.getNodes();
        const theNode = nodes.find((n) => n.id === d.connected.id);
        if (theNode) {
          ChartUtils.findNodeInDom(theNode);
        }
      }, 200);
    }
  }

  render() {
    const { nodeId, exportNode, nodeData } = this.props;
    const queryObj = queryString.parse(window.location.search);
    const { connectedNodes, length } = this.getGroupedConnections(nodeId);

    if (exportNode) {
      connectedNodes.map((nodeGroup) => {
        nodeGroup.map((d) => {
          if (d.connected.icon && d.connected.icon.startsWith('blob')) {
            d.connected.icon = nodeData.find((node) => node.id === d.connected.id).icon;
          }
        });
      });
    }

    return (!connectedNodes.length ? null
      : (
        <div className="connectionDetails">
          <details open>
            <summary>
              Connections (
              {length}
              )
            </summary>
            <div className="connection-container">
              {connectedNodes.map((nodeGroup) => (
                <div className="row" key={nodeGroup[0].linkType}>

                  <fieldset>
                    <legend className="linkTypes">{nodeGroup[0].linkType}</legend>
                    <ul className="list">
                      {nodeGroup.map((d) => (
                          <li className="item" key={d.connected.id}>
                            {exportNode === undefined || exportNode === false
                                ? (
                                    <Link
                                        onClick={(ev) => this.openFolder(ev, d)}
                                        replace
                                        to={`?${queryString.stringify({ ...queryObj, info: d.connected.id })}`}
                                    >
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
                  </fieldset>

                </div>
              ))}
            </div>
          </details>
        </div>
      )
    );
  }
}

export default ConnectionDetails;
