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
import Utils from '../../helpers/Utils';

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    addNodeParams: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodeData: {},
      errors: {},
    };
  }


  initNodeData = memoizeOne(() => {
    const nodes = Chart.getNodes();
    const { nodeData: { type } } = this.state;
    this.setState({
      nodeData: {
        value: 1,
        name: '',
        icon: '',
        type: type || _.last(nodes)?.type || '',
      },
      errors: {},
    });
  }, _.isEqual)

  getTypes = memoizeOne((nodes) => {
    const types = nodes.filter((d) => d.type)
      .map((d) => ({
        value: d.type,
        label: d.type,
      }));

    return _.uniqBy(types, 'value');
  }, _.isEqual)

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
    if (!nodeData.type) {
      errors.type = 'Type is required';
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
    const types = this.getTypes(nodes);

    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen={!_.isEmpty(addNodeParams)}
        onRequestClose={this.closeModal}
      >
        <h2>Add new node</h2>
        <img src="" id="hello" alt="" />
        <Select
          isClearable
          label="Type"
          value={[
            types.find((t) => t.value === nodeData.type) || { value: nodeData.type, label: nodeData.type },
          ]}
          options={types}
          error={errors.type}
          onChange={(v) => this.handleChange('type', v?.value || '')}
        />
        <Input
          label="Name"
          value={nodeData.name}
          error={errors.name}
          onChangeText={(v) => this.handleChange('name', v)}
        />
        <Input
          label="Value"
          value={nodeData.value}
          onChangeText={(v) => this.handleChange('value', v)}
          type="number"
          min={1}
          autoComplete="off"
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
