import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import CustomFields from '../../helpers/CustomFields';
import ConnectionDetails from '../nodeInfo/ConnectionDetails';
import Chart from '../../Chart';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import NodeImage from '../nodeInfo/NodeImage';

// import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';

class ExportNode extends Component {
  static propTypes = {
    // tabs: PropTypes.func.isRequired,
    node: PropTypes.func.isRequired,
    // nodeData: PropTypes.func.isRequired,
    // image: PropTypes.func.isRequired,
    title: PropTypes.func.isRequired,
    // singleGraph: PropTypes.object.isRequired,

  }

  render() {
    const { node, title } = this.props;

    const {
      nodesPartial, linksPartial, labels, tabs, nodeData,
    } = this.setState;

    // const {
    //   tabs, node, nodeData, image, title,
    // } = this.props;
    const customField = CustomFields.get(tabs, node.type, node.id);
    let links = Chart.getLinks();
    links = links.find((n) => n.source === node.id || n.target === node.id);

    return (
      <div id="nodeFullInfo">
        <div className="nodeFullContent">
          <div className="nodeHeader">

            <div>
              <LogoSvg className="orange" />
            </div>
            <div className="textWrapper">
              <h3 className="graph">
                Graph:

                <p>
                  {title}

                </p>
              </h3>
              <h3 className="name">
                Node:
                <p>{node.name}</p>
              </h3>
              <h3 className="type">
                Type:
                <p>{node.type}</p>
              </h3>
              <h3 className="name">
                Created:
                <p>n n j</p>
              </h3>
            </div>
          </div>
          <div className="nodeImg">
            {/* <div className="headerBanner"> */}
            <NodeImage node={node} />

            {/* </div> */}
            <div className="nodImgNameType">
              <h3 className="name">
                <p>{node.name}</p>
              </h3>
              <h3 className="type">
                <p>{node.type}</p>
              </h3>
            </div>
            <div className="nodeKeywords">
              {node.keywords.map((p) => (
                <span>{`${p}  `}</span>
              ))}
            </div>
          </div>
          {!_.isEmpty(tabs) ? (
            <div className="nodeTabs">
              <div className="contentWrapper">
                <div className="content">
                  {Object.keys(customField).map((item) => (
                    <div className="content-parts">
                      <h2>{item}</h2>
                      {customField[item]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

        </div>
        {links ? (
          <div className="connectionDetailsGeneral">
            <div className="contentWrapper">
              <h2 className="connectionDetails">Connections</h2>
              <ConnectionDetails
                nodeId={node.id}
                exportNode
                nodeData={nodeData}
                links={linksPartial}
                labels={labels}
                nodes={nodesPartial}
              />

            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
// const mapStateToProps = (state) => ({
//   singleGraph: state.graphs.singleGraph,
// });

// const mapDispatchToProps = {
//   getNodeCustomFieldsRequest,
// };

// const Container = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(ExportNode);

export default ExportNode;
