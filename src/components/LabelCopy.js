import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import Tooltip from 'rc-tooltip';
import ContextMenu from './contextMenu/ContextMenu';
import LabelUtils from '../helpers/LabelUtils';
import Button from './form/Button';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import Chart from '../Chart';

class LabelCopy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duplicatedNodes: [],
      nodesLength: 0,
    };
  }

  componentDidMount() {
    ContextMenu.event.on('label.append', this.handleLabelAppend);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('label.append', this.handleLabelAppend);
  }

  fixDuplications = () => {
    const { position } = this.state;
    const data = LabelUtils.getData();
    LabelUtils.past(data, position);
    this.closeModal();
  }

  handleLabelAppend = (ev, params) => {
    const { x, y } = params;
    const { duplicatedNodes } = LabelUtils.compare();
    const position = [x, y];
    const data = LabelUtils.getData();
    if (_.isEmpty(duplicatedNodes)) {
      LabelUtils.past(data, position);
      return;
    }
    this.setState({ duplicatedNodes, nodesLength: data.nodes.length, position });
  }

  skipDuplications = () => {
    const { duplicatedNodes, position } = this.state;
    const data = LabelUtils.getData();
    data.nodes = data.nodes.filter((n) => !duplicatedNodes.some((d) => n.id === d.id));
    LabelUtils.past(data, position);
    this.closeModal();
  }

  closeModal = () => {
    this.setState({ duplicatedNodes: [], nodesLength: 0, position: [] });
  }

  replaceDuplications = () => {
    const { position } = this.state;
    const data = LabelUtils.getData();
    const nodes = Chart.getNodes();
    data.nodes = data.nodes.map((n) => {
      const duplicate = nodes.find((d) => n.name === d.name);
      if (duplicate) {
        const originalId = n.id;
        n.id = duplicate.id;
        n.replace = true;
        data.links = data.links.map((l) => {
          if (l.source === originalId) {
            l.source = n.id;
          }
          if (l.target === originalId) {
            l.target = n.id;
          }
          return l;
        });
      }
      return n;
    });
    LabelUtils.past(data, position);
    this.closeModal();
  }

  render() {
    const { duplicatedNodes, nodesLength } = this.state;
    if (_.isEmpty(duplicatedNodes)) {
      return null;
    }
    return (
      <Modal
        isOpen
        className="ghModal graphCompare"
        overlayClassName="ghModalOverlay graphCompareOverlay"
      >
        <h4 className="subtitle">
          {`Moving ${nodesLength} nodes from ${'AAA'} to ${'BBB'}.`}
        </h4>
        <h2 className="title">
          {`The destinations has ${duplicatedNodes.length} nodes with the same type and name`}
        </h2>
        <div className="buttonsWrapper">
          <Button className="actionButton" icon={<EditSvg style={{ height: 30 }} />}>
            Compare nodes
          </Button>
          <Button onClick={this.replaceDuplications} className="actionButton" icon={<EditSvg style={{ height: 30 }} />}>
            Replace the nodes in the destination
          </Button>
          <Button onClick={this.skipDuplications} className="actionButton" icon={<EditSvg style={{ height: 30 }} />}>
            Skip these nodes
          </Button>
          <Button onClick={this.fixDuplications} className="actionButton" icon={<EditSvg style={{ height: 30 }} />}>
            ???
          </Button>
        </div>

      </Modal>
    );
  }
}

export default LabelCopy;
