import React, { Component } from 'react';
import _ from 'lodash';
import CustomFields from '../../helpers/CustomFields';
import ConnectionDetails from '../nodeInfo/ConnectionDetails';
import Chart from '../../Chart';

class ExportNode extends Component {
  render() {
    const {
      tabs, node, nodeData, image,
    } = this.props;

    const customField = CustomFields.get(tabs, node.type, node.id);

    let links = Chart.getLinks();

    links = links.find((n) => n.source === node.id || n.target === node.id);

    return (
      <div id="nodeFullInfo">
        <div className="nodeFullContent">
          <div className="headerBanner">
            <img
              src={image}
              alt=""
            />
            <div className="textWrapper">
              <h2 className="name">{node.name}</h2>
              <h3 className="type">{node.type}</h3>
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
              <ConnectionDetails nodeId={node.id} exportNode nodeData={nodeData} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default ExportNode;
