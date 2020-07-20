import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import { toggleNodeModal } from '../../store/actions/app';
import Select from '../form/Select';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import FileInput from '../form/FileInput';
import { nodeTypes } from "../../data/node";

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    addNodeParams: PropTypes.object.isRequired,
  }

  initNodeData = memoizeOne(() => {
    const nodes = Chart.getNodes();
    const { nodeData: { group } } = this.state;
    this.setState({
      nodeData: {
        name: '',
        icon: '',
        type: 'circle',
        group: group || _.last(nodes)?.group || '',
      },
      errors: {},
    });
  }, _.isEqual)

  getGroups = memoizeOne((nodes) => {
    const types = nodes.filter((d) => d.group)
      .map((d) => ({
        value: d.group,
        label: d.group,
      }));

    return _.uniqBy(types, 'value');
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      nodeData: {},
      errors: {},
    };
  }

  closeModal = () => {
    this.props.toggleNodeModal();
  }

  addNode = async () => {
    const { addNodeParams } = this.props;
    const { nodeData } = this.state;
    const errors = {};
    const nodes = Chart.getNodes();
    if (!nodeData.name) {
      errors.name = 'Name is required';
    } else if (nodes.some((d) => d.name === nodeData.name)) {
      errors.name = 'Already exists';
    }
    if (!nodeData.group) {
      errors.group = 'Group is required';
    }

    if (_.isEmpty(errors)) {
      nodes.push({ ...addNodeParams, ...nodeData });
      Chart.render({ nodes });
      this.props.toggleNodeModal();
    }
    this.setState({ errors });
  }

  handleChange = (path, value) => {
    const { nodeData, errors } = this.state;
    _.set(nodeData, path, value);
    _.remove(errors, path);
    this.setState({ nodeData, errors });
  }


  render() {
    const { nodeData, errors } = this.state;
    const { addNodeParams } = this.props;
    this.initNodeData(addNodeParams);
    const nodes = Chart.getNodes();
    const groups = this.getGroups(nodes);

    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen={!_.isEmpty(addNodeParams)}
        onRequestClose={this.closeModal}
      >
        <h2>Add new node</h2>
        <Input
          label="Name"
          value={nodeData.name}
          error={errors.name}
          onChangeText={(v) => this.handleChange('name', v)}
        />
        <Select
          isClearable
          label="Type"
          value={[
            groups.find((t) => t.value === nodeData.group) || { value: nodeData.group, label: nodeData.group },
          ]}
          options={groups}
          error={errors.group}
          onChange={(v) => this.handleChange('group', v?.value || '')}
        />
        <Select
          label="Node Type"
          options={nodeTypes}
          isSearchable={false}
          value={nodeTypes.find((t) => t.value === nodeData.type)}
          error={errors.type}
          onChange={(v) => this.handleChange('type', v.value)}
        />
        <FileInput
          label="Icon"
          accept=".png,.jpg,.svg"
          value={nodeData.icon}
          onChangeFile={(v) => this.handleChange('icon', v)}
        />
        <div className="buttons">
          <Button onClick={this.closeModal}>
            Cancel
          </Button>
          <Button onClick={this.addNode}>
            Add
          </Button>
        </div>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  addNodeParams: state.app.addNodeParams,
});
const mapDespatchToProps = {
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(AddNodeModal);

export default Container;
