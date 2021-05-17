import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveButton } from '../../store/actions/app';
import ApiGraphModal from "./ApiGraphModal";

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
        <button className="newGraph" onClick={this.toggleModal}>
          G
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
