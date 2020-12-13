import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import WikipediaSvg from '../../assets/images/wikipedia.svg';
import { setActiveButton } from '../../store/actions/app';
import WikiModal from "./WikiModal";

class WikiButton extends Component {
    static propTypes = {
      activeButton: PropTypes.string.isRequired,
      setActiveButton: PropTypes.func.isRequired,
    }

    toggleModal = () => {
      const { activeButton } = this.props;
      this.props.setActiveButton(activeButton === 'wiki' ? 'create' : 'wiki');
    }

  render() {
    const { activeButton } = this.props;
    return (
      <>
        <button className="wikiButton" onClick={this.toggleModal}>
          <img src={WikipediaSvg} alt="wikipedia" />
        </button>

        {activeButton === 'wiki' ? (
          <WikiModal onClose={this.toggleModal} />
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
)(WikiButton);

export default Container;
