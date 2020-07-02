import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import Input from '../form/Input';
import Button from '../form/Button';
import Editor from "../form/Editor";

class DataEditorDescription extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    value: PropTypes.string,
  }

  static defaultProps = {
    value: '',
  }

  closeModal = async (ev) => {
    this.props.onClose(ev);
    document.dispatchEvent(new Event('mousedown'));
    document.dispatchEvent(new Event('mouseup'));
  }

  render() {
    const { onClose, onChangeText, ...props } = this.props;
    return (
      <>
        <Modal
          isOpen
          className="ghModal ghTableModal"
          overlayClassName="ghModalOverlay"
          onRequestClose={this.closeModal}
        >
          <h3>Description</h3>
          <Editor {...props} onChange={onChangeText} />
          <Button onMouseDown={this.closeModal}>Save</Button>
        </Modal>
        <span className="value-viewer" dangerouslySetInnerHTML={{ __html: props.value }} />
      </>
    );
  }
}

export default DataEditorDescription;
