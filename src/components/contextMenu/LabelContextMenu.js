import React, { Component } from 'react';
import Button from '../form/Button';

class labelContextMenu extends Component {
  render() {
    return (
      <>
        <Button icon="fa-copy" onClick={(ev) => this.props.onClick(ev, 'label.copy')}>
          Copy
        </Button>
        <Button icon="fa-eraser" onClick={(ev) => this.props.onClick(ev, 'label.delete')}>
          Delete
        </Button>
      </>
    );
  }
}

export default labelContextMenu;
