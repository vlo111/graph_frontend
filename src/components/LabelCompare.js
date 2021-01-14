import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import ContextMenu from './contextMenu/ContextMenu';
import LabelUtils from '../helpers/LabelUtils';
import Button from './form/Button';
import Chart from '../Chart';

class LabelCompare extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const { duplicatedNodes, onRequestClose } = this.props;
    return (
      <Modal
        isOpen
        className="ghModal graphCompare"
        overlayClassName="ghModalOverlay graphCompareOverlay"
        onRequestClose={onRequestClose}
      >

      </Modal>
    );
  }
}

export default LabelCompare;
