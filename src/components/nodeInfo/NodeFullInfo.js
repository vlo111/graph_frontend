import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';
import { toggleNodeFullInfo } from '../../store/actions/app';
import Outside from '../Outside';
import NodeTabs from './NodeTabs';
import bgImage from '../../assets/images/Colorful-Plait-Background.jpg';
import HeaderMini from '../HeaderMini';
import NodeIcon from "../NodeIcon";

class NodeFullInfo extends Component {
  static propTypes = {
    infoNodeName: PropTypes.string.isRequired,
    toggleNodeFullInfo: PropTypes.func.isRequired,
  }

  closeNodeInfo = () => {
    this.props.toggleNodeFullInfo('');
  }

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
      }
    });

    const connectedNodesGroup = Object.values(_.groupBy(connectedNodes, 'linkType'));
    return _.orderBy(connectedNodesGroup, (d) => d.length, 'desc');
  })

  render() {
    const { infoNodeName } = this.props;
    if (!infoNodeName) {
      return null;
    }
    const node = Chart.getNodes().find((n) => n.name === infoNodeName);
    if (!node) {
      return null;
    }
    const connectedNodes = this.getGroupedConnections(node.name);
    return (
      <Outside onClick={this.closeNodeInfo} exclude=".nodeTabsFormModalOverlay,.contextmenuOverlayFullInfo,.jodit">
        <div id="nodeFullInfo">
          <HeaderMini />
          <div className="mainContent">
            <div className="headerBanner">
              <img src={bgImage} alt="background" />
              <div className="textWrapper">
                <h2 className="name">{node.name}</h2>
                <h3 className="type">{node.type}</h3>
              </div>
            </div>
            <NodeTabs node={node} />
          </div>
          <div className="connectionDetails">
            {connectedNodes.map((nodeGroup) => (
              <div className="row">
                <h3>{`${nodeGroup[0].linkType} (${nodeGroup.length})`}</h3>
                <ul className="list">
                  {nodeGroup.map((d) => (
                    <li className="item">
                      <div className="left">
                        <NodeIcon node={d.connected} />
                      </div>
                      <div className="right">
                        <span className="name">{d.connected.name}</span>
                        <span className="type">{d.connected.type}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Outside>
    );
  }
}

const mapStateToProps = (state) => ({
  infoNodeName: state.app.infoNodeName,
});

const mapDispatchToProps = {
  toggleNodeFullInfo,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeFullInfo);

export default Container;
