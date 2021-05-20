import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import ScienceGraphModal from "./ScienceGraphModal";
import Button from '../form/Button';
import ApiImg from '../../assets/images/icons/science.png';

class ScienceButton extends Component {
    static propTypes = {
      // activeButton: PropTypes.string.isRequired,
      // setActiveButton: PropTypes.func.isRequired,
    }

    toggleModal = () => {
      const { activeButton } = this.props;
      this.props.setActiveButton(activeButton === 'api' ? 'create' : 'api');
    }

  render() {
    const { activeButton } = this.props;
    return (
      <>
        <button
          className="scienceGraph wikiButton"
          onClick={this.toggleModal}
        >
          <img src={ApiImg} alt="science" />
        </button>

        {activeButton === 'api' ? (
          <ScienceGraphModal onClose={this.toggleModal} />
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
)(ScienceButton);

export default Container;
