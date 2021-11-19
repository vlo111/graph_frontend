import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Button from '../../form/Button';
import { ReactComponent as EditSvg } from '../../../assets/images/icons/edit.svg';
import { ReactComponent as InfoSvg } from '../../../assets/images/icons/info.svg';
import CustomFields from '../../../helpers/CustomFields';
import { toggleNodeModal } from '../../../store/actions/app';
import NodeImage from './NodeImage';
import { getSingleGraph } from '../../../store/selectors/graphs';
import GraphUsersInfo from '../../History/GraphUsersInfo';
import NodeOfConnection from './NodeOfConnection';
import MapsInfo from '../../maps/MapsInfo';

const General = ({
  node, tabs, editable = true, connectedNodes,
}) => {
  const dispatch = new useDispatch();

  const [showNodeInfo, setShowNodeInfo] = useState(false);

  const updateNode = () => {
    if (node.readOnly) {
      return;
    }
    const customField = CustomFields.get(tabs, 'node.edit', node.id);

    dispatch(toggleNodeModal({ ...node, customField }));
  };

  const singleGraph = useSelector(getSingleGraph);

  const { linksPartial, labels } = singleGraph;

  /* @todo get document elements size
  * 56 graph header height
  * 60 - tab header user info
  * 60 - tab header
  *  */

  const height = window.innerHeight - 56 - 58 - 60 - 100;

  const contentStyle = {
    height,
    overflow: 'auto',
  };

  return (
    <div className="general">
      <div className="general-hider">
        <div className="general-hider-picture">
          <NodeImage node={node} />
        </div>
        <div className="general-hider-caption">
          <div className="general-hider-caption-nodeInfo">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <span className="name">{node.name}</span>
              <div style={{ display: 'flex', width: '100%' }} />
              <span className="type">{node.type}</span>
            </div>
          </div>
        </div>
        <div className="general-hider-icons">
          {editable && (
            <>
              <button
                title="info"
                className="info"
                onClick={() => setShowNodeInfo(!showNodeInfo)}
              >
                <InfoSvg />
              </button>
              <button
                title="edit"
                className="edit"
                onClick={updateNode}
              >
                <EditSvg />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="general-footer" style={contentStyle}>
        <div className="items">
          <div className="general-footer-item leftLine">
            <span className="item-text">Name: </span>
            <span>{node.name}</span>
          </div>
          <div className="general-footer-item leftLine">
            <span className="item-text">Label: </span>
            <span>
              {!node.keywords?.length ? 'there is not keyword'
                : (
                  <div className="general-footer-item-keywords">
                    {node.keywords.map((p) => (
                      <span>{`${p}  `}</span>
                    ))}
                  </div>
                )}
            </span>
          </div>
          <div className="general-footer-item leftLine">
            <span className="item-text">Link: </span>
            {node.link
              ? (
                <span>
                  <a
                    target="_blank"
                    href={node.link}
                    title={node.link}
                    className="node-name"
                    rel="noreferrer"
                  >
                    {node.link.length > 30 ? `${node.link.substring(0, 30)}...` : node.link}
                  </a>
                </span>
              ) : 'there is not link'}
          </div>
          {node.location?.length && (
          <div className="general-footer-item general-footer-location leftLine">
            <span className="location-text">
              <details className="general-footer-node">
                <summary>
                  <div>Location:</div>
                  <span className="location-value">
                    <div>
                      {node.location[0].address.length > 25 ? `${node.location[0].address.substring(0, 25)}...`
                        : node.location[0].address}
                    </div>
                  </span>
                </summary>
                <div className="location-map"><MapsInfo node={node} /></div>
              </details>
            </span>
          </div>
          )}
          {connectedNodes.map((nodeGroup) => (
            <details className="general-footer-item leftLine">
              <summary>
                <div className="title">{`${nodeGroup[0].linkType}:`}</div>
                <div className="node-name">{`${nodeGroup.length} ${nodeGroup.length > 1 ? 'connections' : 'connection'}`}</div>
              </summary>
              <div className="connections">
                <NodeOfConnection labels={labels} nodes={nodeGroup} links={linksPartial} nodeId={node.id} />
              </div>
            </details>
          ))}
        </div>
      </div>
      {showNodeInfo ? (
        <GraphUsersInfo
          closeModal={() => setShowNodeInfo(!showNodeInfo)}
          graph={singleGraph}
        />
      ) : null}
    </div>
  );
};

General.propTypes = {
  node: PropTypes.object.isRequired,
  tabs: PropTypes.object.isRequired,
  connectedNodes: PropTypes.string.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default General;
