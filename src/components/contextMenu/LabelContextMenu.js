import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '../form/Button';
import LabelUtils from '../../helpers/LabelUtils';

class labelContextMenu extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
  }

  handleCopyClick = (ev) => {
    const { params, customFields, match: { params: { graphId = '' } } } = this.props;
    const data = LabelUtils.copy(graphId, params.id, customFields);
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

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(labelContextMenu);

export default withRouter(Container);
