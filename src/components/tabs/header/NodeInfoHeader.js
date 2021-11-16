import React, { useState } from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import NodeIcon from '../../NodeIcon';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import Utils from '../../../helpers/Utils';
import ExportNodeTabs from '../../ExportNode/ExportNodeTabs';
import Button from '../../form/Button';
import { ReactComponent as ExpandSvg } from '../../../assets/images/icons/expand.svg';

const getElement = (name) => document.querySelector(name);

const NodeInfoHeader = ({
  node, history, setSingleExpand, singleExpand,
  setTabsExpand, connectedNodes, title, tabs, tabsExpand,
}) => {
  const closeNodeInfo = () => {
    getElement('.tab-wrapper').style.transform = 'scaleX(0)';

    const queryObj = queryString.parse(window.location.search);

    delete queryObj.info;
    const query = queryString.stringify(queryObj);
    history.replace(`?${query}`);

    // move autoplay right
    const right = '15px';

    getElement('#autoPlay').style.right = right;
    getElement('.graphControlPanel').style.right = right;

    setSingleExpand(false);
  };

  const expandTabs = () => {
    setTabsExpand(!tabsExpand);
  };

  return (
    <div className="node-info">
      <div className="node-info-container">
        <div className="node">
          <NodeIcon node={node} />
          <div className="name">
            {(!singleExpand && !tabsExpand) ? (node.name.length > 15
              ? `${node.name.substring(0, 15)}...`
              : node.name) : node.name}
          </div>
          <div className="type">
            {`Type: ${!singleExpand ? (node.type.length > 15
              ? `${node.type.substring(0, 15)}...`
              : node.type) : node.name}`}
          </div>
        </div>
        <div className="tab-close">
          {!singleExpand && (
          <Button
            icon={<ExpandSvg />}
            title="expand"
            onClick={expandTabs}
          />
          )}
          <ExportNodeTabs
            node={node}
            tabs={tabs}
            image={node.icon}
            connectedNodes={connectedNodes}
            title={title}
            name="name"
          />
          <Button
            icon={<CloseSvg />}
            className="clear"
            onClick={closeNodeInfo}
          />
        </div>
      </div>
    </div>
  );
};

NodeInfoHeader.propTypes = {
  node: PropTypes.object.isRequired,
  singleExpand: PropTypes.bool.isRequired,
  tabsExpand: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  connectedNodes: PropTypes.object.isRequired,
  setSingleExpand: PropTypes.func.isRequired,
  setTabsExpand: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  tabs: PropTypes.object.isRequired,
};

export default NodeInfoHeader;
