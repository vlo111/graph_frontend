import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import { convertGraphRequest } from '../../store/actions/graphs';
import ImportXlsx from './ImportXlsx';
import Button from '../form/Button';
import ImportGoogle from "./ImportGoogle";

class DataImportModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'xlsx',
    }
  }

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab })
  }

  render() {
    const { activeTab } = this.state;
    const { activeButton } = this.props;
    return (
      <Modal
        isOpen={activeButton === 'import'}
        className="ghModal ghImportModal"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <div className="ghTabs">
          <Button className={activeTab === 'xlsx' ? 'active' : undefined} onClick={() => this.setActiveTab('xlsx')}>
            EXCEL XLSX
          </Button>
          <Button className={activeTab === 'google' ? 'active' : undefined} onClick={() => this.setActiveTab('google')}>
            GOOGLE SHEETS
          </Button>
        </div>
        {activeTab === 'xlsx' ? <ImportXlsx /> : null}
        {activeTab === 'google' ? <ImportGoogle /> : null}
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
