import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';

class LabelShare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    const { open } = this.state;
    return (
      <Modal
        className="ghModal ghModalLabelShare"
        overlayClassName="ghModalOverlay ghModalLabelShareOverlay"
        isOpen={open}
        onRequestClose={this.closeModal}
      >

      </Modal>
    );
  }
}

export default LabelShare;
