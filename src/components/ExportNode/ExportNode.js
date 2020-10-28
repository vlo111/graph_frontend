import React, { Component } from 'react';
import _ from 'lodash';
import CustomFields from '../../helpers/CustomFields';
import ConnectionDetails from '../nodeInfo/ConnectionDetails';
import Chart from '../../Chart';

class ExportNode extends Component {
  render() {
    const {
      Tabs, NodeName, NodeType, ConnectionNodes
    } = this.props;

    const customField = CustomFields.get(Tabs, NodeType, NodeName);

    let links = Chart.getLinks();

    links = links.find((n) => n.source === NodeName || n.target === NodeName);

    return (
      <div id="nodeFullInfo">
        <div className="nodeFullContent">
          <div className="headerBanner">
            <img
              src="HeaderImagePlace"
              alt=""
            />
            <div className="textWrapper">
              <h2 className="name">{NodeName}</h2>
              <h3 className="type">{NodeType}</h3>
            </div>
          </div>
          {!_.isEmpty(Tabs) ? (
            <div className="nodeTabs">
              <div className="contentWrapper">
                <div className="content">
                  {Object.keys(customField).map((item) => (
                    <div>
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
              <ConnectionDetails nodeName={NodeName} exportNode ConnectionNodes={ConnectionNodes} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default ExportNode;
