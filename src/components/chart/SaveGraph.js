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
      <div className="saveGraphWrapper">
        <Button className="saveGraph" onClick={() => this.toggleModal(true)}>
          Save Graph
        </Button>
        {showModal ? (
          <SaveGraphModal toggleModal={this.toggleModal} />
        ) : null}
      </div>
    );
  }
}

export default SaveGraph;
