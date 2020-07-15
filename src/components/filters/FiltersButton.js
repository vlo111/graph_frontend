import React, { Component } from 'react';
import Button from "../form/Button";

class FiltersButton extends Component {
  render() {
    return (
      <Button className="toggleFilter" onClick={() => this.download('png')}>filters</Button>
    );
  }
}

export default FiltersButton;
