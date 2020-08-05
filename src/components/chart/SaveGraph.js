import React, { Component } from 'react';
import Button from '../form/Button';
import SaveGraphModal from './SaveGraphModal';

class SaveGraph extends Component {
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
    return (
      <>
        <Button color="blue" onClick={() => this.toggleModal(true)}>
          Save
        </Button>
        {showModal ? (
          <SaveGraphModal toggleModal={this.toggleModal} />
        ) : null}
      </>
    );
  }
}

export default SaveGraph;
