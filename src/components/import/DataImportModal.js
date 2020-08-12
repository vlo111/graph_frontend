import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import { convertGraphRequest } from '../../store/actions/graphs';
import ImportXlsx from './ImportXlsx';
import _ from "lodash";
import Button from "../form/Button";

class DataImportModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
  }

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  render() {
    const { activeButton } = this.props;
    return (
      <Modal
        isOpen={activeButton === 'import'}
        className="ghModal ghImportModal"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <div className="ghTabs">
          <Button>
            GOOGLE SHEETS
          </Button>
          <Button>
            EXCEL XLSX
          </Button>
        </div>
        <ImportXlsx />

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataImportModal);

export default Container;
