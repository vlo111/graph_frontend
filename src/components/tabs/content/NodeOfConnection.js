import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import Chart from '../../../Chart';
import NodeIcon from '../../NodeIcon';
import ChartUtils from '../../../helpers/ChartUtils';
import Button from '../../form/Button';

const NodeOfConnection = ({
  nodes, isExport, labels,
}) => {
  const queryObj = queryString.parse(window.location.search);

  const openFolder = (e, d) => {
    const label = labels.filter((p) => p.id === d.connected.labels[0])[0];

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

  return nodes.length ? (
    <div className="connectionDetails">
      <div className="connection-container">
        <ul className="list">
          {nodes.map((d) => (
            <li className="item" key={d.node.id}>
              {!isExport
                ? (
                  <Link
                    onClick={(ev) => openFolder(ev, d)}
                    replace
                    to={`?${queryString.stringify({ ...queryObj, info: d.node.id })}`}
                  >
                    <div className="left ">
                      <NodeIcon node={d.node} />
                    </div>
                    <div className="right">
                      <span className="name">
                        {d.node.name && d.node.name.length > 45
                          ? `${d.node.name.substr(0, 45)}... `
                          : d.node.name}
                      </span>
                      <span className="type">{d.node.type}</span>
                    </div>
                  </Link>
                )
                : (
                  <Button className="resultBorder">
                    <div className="left  ">
                      <NodeIcon node={d.node} />
                    </div>
                    <div className="right connectedResult">
                      <span className="name">{d.node.name}</span>
                      <span className="type">{d.node.type}</span>
                    </div>
                  </Button>
                )}
            </li>
          ))}
        </ul>
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
