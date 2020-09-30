import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import Editor from '../form/Editor';
import stripHtml from "string-strip-html";

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
    const { result: description } = stripHtml(props.value || '');
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
        <span className="value-viewer">
          {description}
        </span>
      </>
    );
  }
}

export default DataEditorDescription;
