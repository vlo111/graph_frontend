import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from './form/Input';
import Button from './form/Button';
import { createGraphRequest } from '../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';

class CreateGraphModal extends Component {
  static propTypes = {
    createGraphRequest: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        title: '',
        description: '',
        ...props.data,
      },
    };
  }

  handleChange = (path, value) => {
    const { requestData } = this.state;
    _.set(requestData, path, value);
    this.setState({ requestData });
  }

  addGraph = async () => {
    const { requestData } = this.state;
    const { payload: { data } } = await this.props.createGraphRequest({
      ...requestData,
      status: 'active',
    });
    if (data?.graphId) {
      this.props.history.replace(`/graphs/update/${data.graphId}`);
      return;
    }
    toast.error('Something went wrong');
  }

  render() {
    const { singleGraph, match: { params: { graphId = '' } }, show } = this.props;
    const { requestData } = this.state;
    if (graphId || !_.isEmpty(singleGraph)) {
      if (!show) {
        return null;
      }
    }
    return (
      <Modal
        className="ghModal ghModalSave"
        overlayClassName="ghModalOverlay"
        isOpen
      >
        <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.props.history.goBack} />
        <div className="form">
          <h2>
            Create Graph
          </h2>
          <Input
            label="Title"
            value={requestData.title}
            onChangeText={(v) => this.handleChange('title', v)}
          />
          <Input
            label="Description"
            value={requestData.description}
            textArea
            onChangeText={(v) => this.handleChange('description', v)}
          />
          <div className="buttons">
            <Button className="cancel transparent alt" onClick={this.props.history.goBack}>
              Cancel
            </Button>
            <Button
              className="accent alt saveNode"
              disabled={!requestData.title}
              onClick={this.addGraph}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  createGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateGraphModal);

export default withRouter(Container);
