import React, { Component } from 'react';
import PropTypes from 'prop-types';
import stripHtml from 'string-strip-html';
import Chart from '../Chart';
import Icon from './form/Icon';
import Outside from './Outside';
import ChartUtils from '../helpers/ChartUtils';
import NodeIcon from './NodeIcon';
import Button from './form/Button';
import { connect } from "react-redux";
import queryString from "query-string";
import { withRouter } from "react-router-dom";

const MODAL_WIDTH = 300;

class NodeDescription extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.showInfoTimout = null;
    this.state = {
      node: null,
    };
  }

  componentDidMount() {
    Chart.event.on('node.mouseenter', this.showNodeInfo);
    Chart.event.on('node.mouseleave', this.handleMouseLeave);
    Chart.event.on('node.dragstart', this.hideInfo);
  }

  componentWillUnmount() {
    clearTimeout(this.showInfoTimout);
  }

  getNode = (name) => {
    const nodes = Chart.getNodes();
    const node = nodes.find((n) => n.name === name);
    if (node) {
      node.index = nodes.findIndex((n) => n.name === name);
    }
    return node;
  }

  handleMouseLeave = () => {
    clearTimeout(this.showInfoTimout);
  }

  showNodeInfo = async (d) => {
    clearTimeout(this.showInfoTimout);
    this.showInfoTimout = setTimeout(() => {
      this.setState({
        node: this.getNode(d.name),
      });
    }, 900);
  }

  hideInfo = () => {
    clearTimeout(this.showInfoTimout);
    this.setState({ node: null });
  }

  showFullInfo = () => {
    const { node } = this.state;
    this.hideInfo();
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = node.name;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  render() {
    const { node } = this.state;
    if (!node) {
      return null;
    }
    const { x, y } = ChartUtils.getNodeDocumentPosition(node.index);

    const { scale } = ChartUtils.calcScaledPosition();
    const nodeWidth = ChartUtils.getRadiusList()[node.index] * 2;
    const top = y + (nodeWidth * scale) + 5;
    let left = x + (nodeWidth * scale) + 5;

    if (left + MODAL_WIDTH > window.innerWidth) {
      left = window.innerWidth - MODAL_WIDTH - 15;
    }
    let { result: description } = stripHtml(node.description);
    description = description.length > 130 ? `${description.substr(0, 120)}... ` : description;

    const nodeLinks = Chart.getNodeLinks(node.name, 'all');
    return (
      <Outside onClick={this.hideInfo}>
        <div onMouseLeave={this.hideInfo} data-node-info={node.index} id="nodeDescription" style={{ top, left }}>
          <Icon className="close" value="fa-close" onClick={this.hideInfo} />
          <div className="left">
            <NodeIcon node={node} />
          </div>
          <div className="right">
            {node.link ? (
              <a className="title" href={node.link} target="_blank" rel="noopener noreferrer">
                {node.name}
              </a>
            ) : (
              <h3 className="title">{node.name}</h3>
            )}
            <h4 className="type">
              {node.type}
            </h4>
            <div className="description paragraph">
              {node.description ? (
                <span dangerouslySetInnerHTML={{ __html: description }} />
              ) : null}
              {node.description.length > 130 ? (
                <span className="link">more</span>
              ) : null}
            </div>
            <p className="connections">
              <strong>{'Connections: '}</strong>
              {nodeLinks.length}
            </p>
            <Button onClick={this.showFullInfo}>more</Button>
          </div>
        </div>
      </Outside>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeDescription);

export default withRouter(Container);
