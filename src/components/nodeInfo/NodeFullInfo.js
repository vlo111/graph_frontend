import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import queryString from 'query-string';
import Chart from '../../Chart';
import Outside from '../Outside';
import NodeTabs from './NodeTabs';
import bgImage from '../../assets/images/Colorful-Plait-Background.jpg';
import HeaderMini from '../HeaderMini';
import ConnectionDetails from './ConnectionDetails';
import NodeFullInfoModal from './NodeFullInfoModal';
import ChartUtils from '../../helpers/ChartUtils';


class NodeFullInfo extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    editable: PropTypes.bool,
  }

  static defaultProps = {
    editable: true,
  }

  closeNodeInfo = () => {
    const queryObj = queryString.parse(window.location.search);
    delete queryObj.info;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  render() {
    const { editable, customFields } = this.props;
    const queryObj = queryString.parse(window.location.search);
    const { info: nodeId, expand } = queryObj;
    if (!nodeId) {
      return null;
    }
    const node = Chart.getNodes().find((n) => n.id === nodeId);

    if (node) {
      ChartUtils.findNodeInDom(node);
    }
    if (!node) {
      return null;
    }

    return (
      <Outside onClick={this.closeNodeInfo} exclude=".ghModalOverlay,.contextmenuOverlay,.jodit">
        <div id="nodeFullInfo">
          <HeaderMini
            headerImg={node.icon ? node.icon : bgImage}
            node={node}
            tabs={customFields}
          />
          <div className="nodeFullContent">
            <div className="headerBanner">
              {node.nodeType === 'infography' && false ? (
                <div style={{

                  height: '100%',
                  width: '100%',
                  clipPath: 'url(#cutOff_508.191)'
                }} >
                  <div style={{
                    backgroundImage:  `url(${node.icon}.large)`,
                    backgroundSize: '100% auto',
                    height: '100%',
                    width: '100%',
                  }}/>
                </div>
              ) : (
                <img
                  src={node.icon ? `${node.icon}.large` : bgImage}
                  onError={(ev) => {
                    if (ev.target.src !== node.icon) {
                      ev.target.src = node.icon;
                    } else if (ev.target.src !== bgImage) {
                      ev.target.src = bgImage;
                    }
                  }}
                  alt="background"
                />
              )}

              <div className="textWrapper">
                <h2 className="name">{node.name}</h2>
                <h3 className="type">{node.type}</h3>
              </div>
              <Link replace className="expand" to={`?${queryString.stringify({ ...queryObj, expand: '1' })}`}>
                Expand
              </Link>
            </div>
            <NodeTabs node={node} editable={editable} />
          </div>
          <ConnectionDetails nodeId={node.id} />
        </div>
        {expand === '1' ? (
          <NodeFullInfoModal node={node} />
        ) : null}
      </Outside>
    );
  }
}

const
  mapStateToProps = (state) => ({
    singleGraph: state.graphs.singleGraph, // rerender then data changed
    customFields: state.graphs.singleGraph.customFields || {},
  });

const
  mapDispatchToProps = {};

const
  Container = connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NodeFullInfo);

export default withRouter(Container);
