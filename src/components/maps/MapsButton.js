import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MapImg from '../../assets/images/icons/google-maps.svg';
import MapsModal from './MapsModal';
import { setActiveButton } from '../../store/actions/app';

class MapsButton extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    setActiveButton: PropTypes.func.isRequired,
  }

  toggleModal = () => {
    const { activeButton } = this.props;
    this.props.setActiveButton(activeButton === 'maps' ? 'create' : 'maps');
  }

  render() {
    const { activeButton } = this.props;
    return (
      <>
        <button className="mapButton" onClick={this.toggleModal}>
          <img src={MapImg} alt="google map" />
        </button>
        {activeButton === 'maps' ? (
          <MapsModal onClose={this.toggleModal} />
        ) : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapsButton);

export default Container;
