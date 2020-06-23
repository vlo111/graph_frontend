import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Chart from '../Chart';
import Icon from './form/Icon';
import ShortCode from '../helpers/ShortCode';

const MODAL_WIDTH = 300;

class NodeDescription extends Component {
  static propTypes = {
    nodeDescription: PropTypes.string.isRequired,
  }

  getNode = memoizeOne((name) => {
    const nodes = Chart.getNodes();
    const node = nodes.find((n) => n.name === name);
    if (node) {
      node.index = nodes.findIndex((n) => n.name === name);
    }
    return node;
  })

  render() {
    const { nodeDescription } = this.props;
    const node = this.getNode(nodeDescription);
    if (!node) {
      return null;
    }
    const { x, y } = Chart.getDocumentPosition(node.index);
    const { scale } = Chart.calcScaledPosition();
    const top = y + (node.value * 10 * scale) + 5;
    let left = x * scale;

    if (left + MODAL_WIDTH > window.innerWidth) {
      left = window.innerWidth - MODAL_WIDTH - 5;
    }

    const files = ShortCode.fileParse(node.files);
    const links = ShortCode.linkParse(node.links);
    const mainLink = links.shift();
    return (
      <div data-node-info={node.index} id="nodeDescription" style={{ top, left }}>
        <Icon className="close" value="fa-close" />
        <div className="left">
          {node.icon ? (
            <img src={node.icon} alt="icon" width={50} height={50} />
          ) : (
            <span style={{ background: Chart.color()(node) }} className="icon">{node.name[0]}</span>
          )}
        </div>
        <div className="right">
          {mainLink ? (
            <a className="title" href={mainLink.url} title={mainLink.name}>
              {node.name}
            </a>
          ) : (
            <h3 className="title">{node.name}</h3>
          )}
          {!!node.description && (
            node.description.length < 200 ? (
              <p className="description">{node.description}</p>
            ) : (
              <p className="description">
                {node.description.slice(0, 200)}
                ...
                <button>show more</button>
              </p>
            )
          )}
          {!_.isEmpty(files) ? (
            <div className="files list">
              <h4 className="sub-title">Files</h4>
              <ul>
                {files.map((file) => (
                  <li key={file.url}>
                    <a href={file.url} download>{file.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {!_.isEmpty(links) ? (
            <div className="links list">
              <h4 className="sub-title">Links</h4>
              <ul>
                {files.map((file) => (
                  <li key={file.url}>
                    <a href={file.url} rel="noopener noreferrer" target="_blank">{file.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nodeDescription: state.app.nodeDescription,
});
const mapDespatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(NodeDescription);

export default Container;
