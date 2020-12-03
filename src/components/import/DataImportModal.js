import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import { convertGraphRequest } from '../../store/actions/graphs';
import ImportXlsx from './ImportXlsx';
import Button from '../form/Button';
import ImportGoogle from './ImportGoogle';
import ImportLinkedin from './ImportLinkedin';
import ImportZip from './ImportZip';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Select from '../form/Select';
import { IMPORT_TYPES } from '../../data/import';

class DataImportModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'xlsx',
      nextStep: true,
      initCurrentStep: true,
    };
  }

  closeModal = () => {
    this.props.setActiveButton('create');
    this.setState({
      initCurrentStep: true,
    });
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  showSelectHandler = (param) => {
    this.setState({
      nextStep: param,
      initCurrentStep: param,
    });
  }

  render() {
    const { activeTab, nextStep, initCurrentStep } = this.state;
    const { activeButton } = this.props;

    if (!nextStep && initCurrentStep) {
      this.setState({
        nextStep: true,
      });
    }

    return (
      <Modal
        isOpen={activeButton === 'import'}
        className="ghModal ghImportModal"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <div className="form">

            <h2>Import Data</h2>

            {nextStep
            && (
            <Select
              containerClassName="importSelectLbl"
              label="Choose import data"
              portal
              options={IMPORT_TYPES}
              value={IMPORT_TYPES.filter((t) => t.value === activeTab)}
              onChange={(v) => this.setActiveTab(v.value)}
            />
            )}
            {activeTab === 'zip' ? <ImportZip showSelectHandler={this.showSelectHandler} /> : null}
            {activeTab === 'xlsx' ? <ImportXlsx showSelectHandler={this.showSelectHandler} /> : null}
            {activeTab === 'google' ? <ImportGoogle /> : null}
            {activeTab === 'linkedin' ? <ImportLinkedin /> : null}
          </div>
        </div>
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
