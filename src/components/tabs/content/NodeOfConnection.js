import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import Chart from '../../../Chart';
import NodeIcon from '../../NodeIcon';
import ChartUtils from '../../../helpers/ChartUtils';
import Button from '../../form/Button';

const NodeOfConnection = ({
  nodes, isExport, labels, tabsExpand,
}) => {
  const queryObj = queryString.parse(window.location.search);

  const openFolder = (e, d) => {
    if (!labels) return;

    const label = labels.filter((p) => p.id === d.connected?.labels[0])[0];

    if (label) {
      Chart.event.emit('folder.open', e, label, 'true');

      const lbs = Chart.getLabels().map((lb) => {
        if (lb.id === label.id) {
          lb.open = true;
        }
        return lb;
      });

      Chart.render({ labels: lbs });

      setTimeout(() => {
        const getNodes = Chart.getNodes();
        const theNode = getNodes.find((n) => n.id === d.connected.id);
        if (theNode) {
          ChartUtils.findNodeInDom(theNode);
        }
      }, 200);
    }
  };

  const groupNode = Object.entries(_.groupBy(nodes, 'node.type')).map((p) => ({
    nodeType: p[0], nodes: p[1].map((l) => l.node),
  }));

  return nodes.length ? (
    <div className="connectionDetails">
      <div className="connection-container">

        {groupNode.map((d) => (
          <>
            {d.nodes.map((n) => (
              <div className="item leftLine">
                {!isExport
                  ? (
                    <Link
                      onClick={(ev) => openFolder(ev, d)}
                      replace
                      to={`?${queryString.stringify({ ...queryObj, info: n.id })}`}
                    >
                      <div className="left ">
                        <div className="node-type">
                          {!tabsExpand ? (n.type && n.type.length > 12
                            ? `${n.type.substr(0, 12)}... `
                            : n.type) : n.type}
                        </div>
                      </div>
                      <div className="right">
                        <span className="name">
                          {!tabsExpand ? (n.name && n.name.length > 14
                            ? `${n.name.substr(0, 14)}... `
                            : n.name) : n.name}
                        </span>
                      </div>
                    </Link>
                  )
                  : (
                    <Button className="resultBorder">
                      <div className="left  ">
                        <NodeIcon node={n} />
                      </div>
                      <div className="right connectedResult">
                        <span className="name">{n.name}</span>
                        <span className="type">{n.type}</span>
                      </div>
                    </Button>
                  )}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  ) : null;
};

NodeOfConnection.propTypes = {
  filter: PropTypes.object.isRequired,
  nodes: PropTypes.object.isRequired,
  labels: PropTypes.func.isRequired,
  isExport: PropTypes.func.isRequired,
};

export default NodeOfConnection;
