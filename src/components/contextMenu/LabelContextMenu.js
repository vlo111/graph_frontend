import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Button from '../form/Button';
import Chart from '../../Chart';

class labelContextMenu extends Component {
  handleCopyClick = (ev) => {
    const { params, match: { params: { graphId = '' } } } = this.props;
    const labels = Chart.getLabels();
    const nodes = Chart.getNotesWithLabels().filter((n) => n.labels.includes(params.name));
    const label = labels.find((l) => l.name === params.name);
    const data = {
      label,
      graphId,
      nodes,
    };
    sessionStorage.setItem('label.copy', JSON.stringify(data));
    this.props.onClick(ev, 'label.copy', { data });
  }

  render() {
    return (
      <>
        <Button icon="fa-copy" onClick={this.handleCopyClick}>
          Copy
        </Button>
        <Button icon="fa-eraser" onClick={(ev) => this.props.onClick(ev, 'label.delete')}>
          Delete
        </Button>
      </>
    );
  }
}

export default withRouter(labelContextMenu);
