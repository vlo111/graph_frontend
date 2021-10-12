import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
// import fs from 'fs';
// import path from 'path';
import moment from 'moment';
// import HTMLToPDF from 'convert-html-to-pdf';
import CustomFields from '../../helpers/CustomFields';
import ConnectionDetails from '../nodeInfo/ConnectionDetails';
import Chart from '../../Chart';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
// import Converter from '../../../../Backend/services/Converter';

class ExportNode extends Component {
  static propTypes = {
    node: PropTypes.func.isRequired,
    title: PropTypes.func.isRequired,
    image: PropTypes.object.isRequired,
    tabs: PropTypes.func.isRequired,
  }

  render() {
    const {
      node, title, image, tabs,
    } = this.props;

    const {
      nodesPartial, linksPartial, labels, nodeData,
    } = this.setState;
      // result ===  result.splice(result.indexOf('timePlace'), 9, moment().format('YYYY-MM-DD hh:mm:ss'));
    // const customField = CustomFields.get(tabs, node.type, node.id);
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
                <p>{moment(CustomFields.updatedAt).format('YYYY.MM.DD HH:mm')}</p>
              </h3>
            </div>
          </div>
          <div className="nodeImg">
            <img
              src={image}
              alt=""
            />

            <div className="nodImgNameType">
              <h3 className="name">
                <p>{node.name}</p>
              </h3>
              <h3 className="type">
                <p>{node.type}</p>
              </h3>
            </div>
          </div>
          <div className="nodeKeywords">
            {node.keywords.map((p) => (
              <span>{`${p}  `}</span>
            ))}
          </div>
          <div className="footer-link">
            <a title={node.link} target="_blank" href={node.link} rel="noreferrer">
              {node.link && node.link.length > 45
                ? `${node.link.substr(0, 45)}...`
                : node.link}
            </a>
          </div>
          {!_.isEmpty(tabs) ? (
            <div className="nodeTabs">
              <div className="contentWrapper">
                <div className="content">
                  {tabs.filter((p) => p.name !== '_description').map((item) => (
                    <div className="content-parts">
                      <h2>{item.name}</h2>
                      {item.value}
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
                tabs={tabs}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default ExportNode;
