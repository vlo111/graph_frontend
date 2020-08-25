import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import _ from 'lodash';
import stripHtml from 'string-strip-html';
import { setActiveButton } from '../../store/actions/app';
import Input from '../form/Input';
import Chart from '../../Chart';
import Button from '../form/Button';
import RegExpEscape from '../RegExpEscape';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';

class SearchModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
    };
  }

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  handleChange = (search = '') => {
    const s = search.trim().toLowerCase();
    if (!s) {
      this.setState({ nodes: [], search });
      return;
    }
    let nodes = Chart.getNodes().map((d) => {
      if (d.name.toLowerCase() === s) {
        d.priority = 1;
      } else if (d.type.toLowerCase() === s) {
        d.priority = 2;
      } else if (d.name.toLowerCase().startsWith(s)) {
        d.priority = 3;
      } else if (d.type.toLowerCase().startsWith(s)) {
        d.priority = 4;
      } else if (d.name.toLowerCase().includes(s)) {
        d.priority = 5;
      } else if (d.type.toLowerCase().includes(s)) {
        d.priority = 6;
      } else if (stripHtml(d.description).result.toLowerCase().includes(s)) {
        d.priority = 7;
      }
      return d;
    }).filter((d) => d.priority);
    nodes = _.orderBy(nodes, 'priority').slice(0, 15);
    this.setState({ nodes, search });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return {
      __html: text.replace(new RegExpEscape(search, 'ig'), `<b>${search}</b>`),
    };
  }

  findNode = async (node) => {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(2));
    const { x, y } = ChartUtils.getNodeDocumentPosition(node.index);
    const nodeWidth = ChartUtils.getRadiusList()[node.index] * 2;
    const left = (x * -1) + (window.innerWidth / 2) - nodeWidth;
    const top = (y * -1) + (window.innerHeight / 2) - nodeWidth;
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(left, top).scale(2));
    Chart.event.emit('node.mouseenter', node);
    this.closeModal();
  }

  render() {
    const { nodes, search } = this.state;
    return (
      <Modal
        isOpen
        className="ghModal ghModalSearch"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <Input
          label="Search"
          autoComplete="off"
          value={search}
          containerClassName="graphSearch"
          onChangeText={this.handleChange}
        />
        <ul className="list">
          {nodes.map((d) => (
            <li className="item" key={d.index}>
              <Button onClick={() => this.findNode(d)}>
                <NodeIcon node={d} />
                <span
                  className="name"
                  dangerouslySetInnerHTML={this.formatHtml(d.name)}
                />
                <span
                  className="type"
                  dangerouslySetInnerHTML={this.formatHtml(d.type)}
                />
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchModal);

export default Container;
