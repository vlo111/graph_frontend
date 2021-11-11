import React from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import NodeIcon from '../../NodeIcon';
import Icon from '../../form/Icon';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import Utils from '../../../helpers/Utils';

const getElement = (name) => document.querySelector(name);

const NodeInfoHeader = ({ node, history }) => {
  const closeNodeInfo = () => {
    getElement('.tab-wrapper').style.transform = 'scaleX(0)';

    Utils.sleep(300).then(() => {
      const queryObj = queryString.parse(window.location.search);

      delete queryObj.info;
      const query = queryString.stringify(queryObj);
      history.replace(`?${query}`);
    });

    // move autoplay right
    const right = '15px';

    getElement('#autoPlay').style.right = right;
    getElement('.graphControlPanel').style.right = right;
  };

  return (
    <div className="node-info">
      <div className="node-info-container">
        <div className="node">
          <NodeIcon node={node} />
          <div className="name">{node.name}</div>
        </div>
        <div className="type">{`Type: ${node.type}`}</div>
        <div className="tab-close">
          <Icon value={<CloseSvg />} className="clear" onClick={closeNodeInfo} />
        </div>
      </div>
    </div>
  );
};

NodeInfoHeader.propTypes = {
  node: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default NodeInfoHeader;
