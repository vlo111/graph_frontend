import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Modal from 'react-modal';
import { withRouter } from 'react-router-dom';

class NodeExpand extends Component {
    static propTypes = {}

    render() {

      return (
        <Modal
          className="ghModal"
          overlayClassName="ghModalOverlay ghModalNodeFullInfoOverlay"
          isOpen
          // onRequestClose={this.closeNodeInfoModal}
        >
          <h2>asd</h2>
        </Modal>
      );
    }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeExpand);

export default withRouter(Container);
