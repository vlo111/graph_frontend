import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setActiveButton } from '../../store/actions/app';
import ScienceGraphModal from "./ScienceGraphModal";
import ApiImg from '../../assets/images/icons/science.png';

class ScienceButton extends Component {
    toggleModal = () => {
      const { activeButton } = this.props;
      this.props.setActiveButton(activeButton === 'scienceGraph' ? 'create' : 'scienceGraph');
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

        {activeButton === 'scienceGraph' ? (
          <ScienceGraphModal 
            onClose={this.toggleModal} 
          />
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
