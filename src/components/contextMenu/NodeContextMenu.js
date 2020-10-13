import React, { Component } from 'react';
import Button from '../form/Button';
import Chart from '../../Chart';

class NodeContextMenu extends Component {
  render() {
    const { params } = this.props;
    return (
      <>
        <Button icon="fa-pencil-square-o" onClick={(ev) => this.props.onClick(ev, 'node.edit')}>
          Edit
        </Button>
        {params.link ? (
          <Button icon="fa-link" title={params.link}>
            <a href={params.link} target="_blank" rel="noopener noreferrer">
              Open Link
            </a>
          </Button>
        ) : null}
        <Button icon="fa-eraser" onClick={(ev) => this.props.onClick(ev, 'node.delete')}>
          Delete
        </Button>
      </>
    );
  }
}

export default NodeContextMenu;
