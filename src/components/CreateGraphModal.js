import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Input from './form/Input';
import Button from './form/Button';
import { updateSingleGraph } from '../store/actions/graphs';

class CreateGraphModal extends Component {
  static propTypes = {
    updateSingleGraph: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      graphData: {
        title: '',
        description: '',
      },
    };
  }

  handleChange = (path, value) => {
    const { graphData } = this.state;
    _.set(graphData, path, value);
    this.setState({ graphData });
  }

  addGraph = () => {
    const { graphData } = this.state;
    this.props.updateSingleGraph(graphData);
  }

  render() {
    const { singleGraph, match: { params: { graphId = '' } } } = this.props;
    const { graphData } = this.state;
    if (graphId || !_.isEmpty(singleGraph)) {
      return null;
    }
    return (
      <Modal
        className="ghModal ghModalSave"
        overlayClassName="ghModalOverlay"
        isOpen
      >
        <h2>
          Create Graph
        </h2>
        <Input
          label="Title"
          value={graphData.title}
          onChangeText={(v) => this.handleChange('title', v)}
        />
        <Input
          label="Description"
          value={graphData.description}
          textArea
          onChangeText={(v) => this.handleChange('description', v)}
        />
        <div className="buttons">
          <Button onClick={this.props.history.goBack}>
            Cancel
          </Button>
          <Button
            className="saveNode"
            disabled={!graphData.title}
            onClick={this.addGraph}
          >
            Create
          </Button>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  updateSingleGraph,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateGraphModal);

export default withRouter(Container);
