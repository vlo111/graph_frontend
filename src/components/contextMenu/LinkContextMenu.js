import React, { Component } from 'react';
import Button from '../form/Button';

class LinkContextMenu extends Component {
  render() {
    return (
      <>
        <Button icon="fa-pencil-square-o" onClick={(ev) => this.props.onClick(ev, 'link.edit')}>
          Edit
        </Button>
        <Button icon="fa-eraser" onClick={(ev) => this.props.onClick(ev, 'link.delete')}>
          Delete
        </Button>
      </>
    );
  }
}

export default LinkContextMenu;
