import React, { Component } from 'react';
import FiltersModal from './FiltersModal';
import Button from '../form/Button';

class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    }
  }

  toggleFilter = () => {
    const { open } = this.state;
    this.setState({ open: !open })
  }

  render() {
    const { open } = this.state;
    return (
      <>
        <Button className="toggleFilter" onClick={this.toggleFilter}>filters</Button>
        {open ? <FiltersModal /> : null}
      </>
    );
  }
}

export default Filters;
