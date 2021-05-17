import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import ApiGraphModal from "./ApiGraphModal";
import ScienceSvg from '../../assets/images/icons/science.svg';
import Button from '../form/Button';

class ApiButton extends Component {
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
          className="newGraph wikiButton"
          onClick={this.toggleModal}
        >
          <img src={ScienceSvg} alt="wikipedia" />
        </button>

        {activeButton === 'api' ? (
          <ApiGraphModal onClose={this.toggleModal} />
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
)(ApiButton);

export default Container;
