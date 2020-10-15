import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import LabelUtils from '../../helpers/LabelUtils';

class labelContextMenu extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
  }

  handleCopyClick = (ev) => {
    const { params, match: { params: { graphId = '' } } } = this.props;
    const data = LabelUtils.copy(graphId, params.name);
    this.props.onClick(ev, 'label.copy', { data, graphId });
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
