import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import Button from '../form/Button';
import EmbedModal from './EmbedModal';

class EmbedButton extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
    outOver: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  toggleModal = (showModal) => {
    this.setState({ showModal });
  }

  render() {
    const { showModal } = this.state;
    const { graph, outOver } = this.props;
    return (
      <>
        <div onClick={() => this.toggleModal(true)}>
          Embed
        </div>
        {showModal ? (
          <EmbedModal
            graph={graph}
            onClose={() => this.toggleModal(false)}
            outOver={outOver}
          />
        ) : null}

      </>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmbedButton);

export default Container;
