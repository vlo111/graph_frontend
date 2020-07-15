import React, { Component } from 'react';
import Modal from 'react-modal';
import Checkbox from '../form/Checkbox';
import Button from '../form/Button';
import Chart from "../../Chart";

class FiltersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        hideIsolated: false,
      },
    }
  }

  handleChange = (key, value) => {
    const { filters } = this.state;
    filters[key] = value;
    this.setState({ filters });

    Chart.render(undefined, { filters });
  }

  render() {
    const { filters } = this.state;
    return (
      <Modal
        className="ghModal ghModalFilters"
        overlayClassName="ghModalOverlay ghModalFiltersOverlay"
        isOpen
      >

        <div className="row hideIsolated">
          <Checkbox
            label="Hide isolated nodes"
            checked={filters.hideIsolated}
            onChange={() => this.handleChange('hideIsolated', !filters.hideIsolated)}
          />
        </div>
        <div className="row resetAll">
          <Button className="transparent">RESET ALL</Button>
          Showing 10 nodes out of 14
        </div>
      </Modal>
    );
  }
}

export default FiltersModal;
