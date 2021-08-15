import React, { Component } from 'react';
import Modal from 'react-modal';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

class TabSaveModal extends Component {
  render() {
    return (
      <Modal
        className="ghModal deleteModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={this.props.hide}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.props.hide} />
          <div className="form">
            <h2>Are you sure ?</h2>
            <p>
              Do you want your changes to be saved ?
            </p>
            <div className="buttons">
              <Button className="ghButton cancel transparent alt" onClick={this.props.onClose}>
                NO
              </Button>
              <Button className="ghButton accent alt" type="submit" onClick={this.props.save}>
                YES
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default TabSaveModal;
