import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Button from '../../form/Button';
import { ReactComponent as ExpandSvg } from '../../../assets/images/icons/expand.svg';
import { ReactComponent as EditSvg } from '../../../assets/images/icons/edit.svg';
import CustomFields from '../../../helpers/CustomFields';
import { toggleNodeModal } from '../../../store/actions/app';
import ExportNodeTabs from '../../ExportNode/ExportNodeTabs';
import NodeImage from '../../tabs/NodeImage';
import ConnectionDetails from '../../tabs/ConnectionDetails';
import { getSingleGraph } from '../../../store/selectors/graphs';
import Chart from '../../../Chart';

const getGroupedConnections = memoizeOne((nodeId) => {
  // const { links, nodes } = this.props;
  const nodes = Chart.getNodes();
  const nodeLinks = Chart.getNodeLinks(nodeId, 'all');
  const connectedNodes = nodeLinks && nodeLinks.map((l) => {
    let connected;
    if (l.source === nodeId) {
      connected = nodes.find((d) => d.id === l.target);
    } else {
      connected = nodes.find((d) => d.id === l.source);
    }
    return {
      linkType: l.type,
      node: connected,
    };
  });
  // connectedNodes.length.open = true;
  const connectedNodesGroup = Object.values(_.groupBy(connectedNodes, 'linkType'));
  return {
    connectedNodes: _.orderBy(connectedNodesGroup, (d) => d.length && d.length, 'desc'),
    length: connectedNodes.length,
  };
});

const General = ({
  node, tabs, history, queryObj, editable = true,
}) => {
  const dispatch = new useDispatch();

  const { connectedNodes, length } = getGroupedConnections(node.id);

  const updateNode = () => {
    if (node.readOnly) {
      return;
    }
    const customField = CustomFields.get(tabs, 'node.edit', node.id);

    dispatch(toggleNodeModal({ ...node, customField }));
  };

  const { nodesPartial, linksPartial, labels } = useSelector(getSingleGraph);

  useEffect(() => {

  });

  const titleStyle = { backgroundColor: '#F5F5FA' };

  /* @todo get document elements size
  * 56 graph header height
  * 40 - switch tabs header
  * 260 - tab header
  * 20 - padding tab header content
  *  */

  const height = window.innerHeight - 56 - 40 - 20 - 260;

  const contentStyle = {
    height,
    overflow: 'auto',
  };

  return (
    <div className="general">
      <div className="general-hider">
        <div className="general-hider-title">
          <div className="general-hider-title-icons">
            {editable && (
            <Button
              icon={<EditSvg />}
              title="edit"
              onClick={updateNode}
            />
            )}
            <ExportNodeTabs
              node={node}
              // tabs={nodeCustomFields}
              // nodeData={this.state.nodeData}
              // image={this.state.image}
              // title={title}
                // name={name}
            />
            <Button
              icon={<ExpandSvg />}
              title="expand"
              onClick={() => { history.replace(`?${queryString.stringify({ ...queryObj, expand: '1' })}`); }}
            />
          </div>
        </div>
        <div className="general-hider-caption">
          <div className="general-hider-caption-picture">
            <NodeImage node={node} />
          </div>
          <div className="general-hider-caption-nodeInfo">
            <div style={{ display: 'flex', flexWrap: 'wrap', height: '60px' }}>
              <span className="name">{node.name}</span>
              <span className="type">{node.type}</span>
            </div>
          </div>
        </div>
        {node.keywords && (
        <div className="general-hider-keywords">
          {node.keywords.map((p) => (
            <span>{`${p}  `}</span>
          ))}
        </div>
        )}
      </div>
      <div className="general-footer" style={contentStyle}>
        {node.link && (
        <div className="general-footer-node" style={titleStyle}>
          <div className="title">Link:</div>
          <a
            target="_blank"
            href={node.link}
            title={node.link}
            className="node-name"
            rel="noreferrer"
          >
            {node.link.length > 25 ? `${node.link.substring(0, 22)}...` : node.link}
          </a>
        </div>
        )}
        {connectedNodes.map((nodeGroup) => (
          <details className="general-footer-node">
            <summary>
              <div className="title">{`${nodeGroup[0].linkType}:`}</div>
              <div className="node-name">{`${nodeGroup.length} ${nodeGroup.length > 1 ? 'connections' : 'connection'}`}</div>
            </summary>
            <div className="connections">
              <ConnectionDetails labels={labels} nodes={nodeGroup} links={linksPartial} nodeId={node.id} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

General.propTypes = {
  toggleNodeModal: PropTypes.func.isRequired,
  headerImg: PropTypes.func.isRequired,
  node: PropTypes.func.isRequired,
  tabs: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  history: PropTypes.func.isRequired,
  match: PropTypes.func.isRequired,
  getActionsCountRequest: PropTypes.func.isRequired,
  editable: PropTypes.func.isRequired,
  singleGraph: PropTypes.func.isRequired,
  commentsCount: PropTypes.func.isRequired,
  expand: PropTypes.func.isRequired,
  queryObj: PropTypes.func.isRequired,
  title: PropTypes.func.isRequired,
  nodeCustomFields: PropTypes.func.isRequired,
};

export default withRouter(General);
