import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import EmbedModal from './EmbedModal';

class EmbedButton extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
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
    const { graph } = this.props;
    return (
      <>
        <Button icon="fa-code" className="transparent footer-icon" onClick={() => this.toggleModal(true)} />
        {showModal ? (
          <EmbedModal
            graph={graph}
            onClose={() => this.toggleModal(false)}
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
