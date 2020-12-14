import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '../form/Button';
import LabelUtils from '../../helpers/LabelUtils';
import Chart from '../../Chart';

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

  handleLockClick = (ev) => {
    const { params: { id } } = this.props;
    const labels = Chart.getLabels().map((l) => {
      if (l.id === id) {
        l.status = l.status === 'lock' ? undefined : 'lock';
      }
      return l;
    });
    Chart.render({ labels });
  }

  render() {
    const { params: { status, sourceId } } = this.props;
    if (sourceId) {
      return null;
    }
    return (
      <>
        <Button icon="fa-copy" onClick={this.handleCopyClick}>
          Copy
        </Button>
        <Button icon={status === 'lock' ? 'fa-unlock-alt' : 'fa-lock'} onClick={this.handleLockClick}>
          {status === 'lock' ? 'Unlock' : 'Lock'}
        </Button>
        <Button icon="fa-share-alt" onClick={(ev) => this.props.onClick(ev, 'label.share')}>
          Share
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
