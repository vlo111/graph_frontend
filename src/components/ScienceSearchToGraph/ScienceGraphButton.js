import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setActiveButton } from '../../store/actions/app';
import ScienceGraphModal from "./ScienceGraphModal";
import ApiImg from '../../assets/images/icons/science.png';

class ScienceButton extends Component {
    toggleModal = () => {
      const { activeButton } = this.props;
      this.props.setActiveButton(activeButton === 'api' ? 'create' : 'api');
    }

  render() {
    const { activeButton, graphId, currentUserId } = this.props;
    return (
      <>
        <button
          className="scienceGraph wikiButton"
          onClick={this.toggleModal}
        >
          <img src={ApiImg} alt="science" />
        </button>

        {activeButton === 'api' ? (
          <ScienceGraphModal 
            onClose={this.toggleModal} 
            graphId={graphId} 
            currentUserId={currentUserId}
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
