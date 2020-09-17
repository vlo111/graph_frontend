import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Chart from '../../Chart';
import _ from 'lodash';
import { toggleNodeFullInfo } from '../../store/actions/app';
import Outside from '../Outside';
import NodeTabs from './NodeTabs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import bgImage from '../../assets/images/Colorful-Plait-Background.jpg'
import HeaderMini from "../HeaderMini";
import memoizeOne from "memoize-one";

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
    const linksGrouped = {};
    nodeLinks.forEach((l) => {
      if (!linksGrouped[l.type]) {
        linksGrouped[l.type] = [];
      }
      let connected;
      if (l.source === nodeName) {
        connected = nodes.find(d => d.name === l.target);
      } else {
        connected = nodes.find(d => d.name === l.source);
      }
      linksGrouped[l.type].push(connected);
    })
    return linksGrouped;
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
    const linksGrouped = this.getGroupedConnections(node.name);
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
            {_.map(linksGrouped, (linkGroup, type) => (
              <div className="row">
                <h3>{type}</h3>
                <ul className="list">
                  {linkGroup.map((link) => (
                    <li>
                      <p>{link.name}</p>
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
