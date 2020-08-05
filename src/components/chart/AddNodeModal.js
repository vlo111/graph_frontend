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
import { NODE_TYPES } from '../../data/node';
import Validate from '../../helpers/Validate';

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    addNodeParams: PropTypes.object.isRequired,
  }

  initNodeData = memoizeOne(() => {
    const nodes = Chart.getNodes();
    // const { nodeData: { type } } = this.state;
    this.setState({
      nodeData: {
        name: '',
        icon: '',
        nodeType: 'circle',
        type:  _.last(nodes)?.type || '',
      },
      errors: {},
    });
  }, _.isEqual)

  getGroups = memoizeOne((nodes) => {
    const types = nodes.filter((d) => d.type)
      .map((d) => ({
        value: d.type,
        label: d.type,
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

    [errors.name, nodeData.name] = Validate.nodeName(nodeData.name);
    [errors.type, nodeData.type] = Validate.nodeType(nodeData.type);

    if (!Validate.hasError(errors)) {
      nodes.push({ ...addNodeParams, ...nodeData });
      Chart.render({ nodes });
      this.props.toggleNodeModal();
    }
    this.setState({ errors, nodeData });
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
        <Select
          isClearable
          label="Type"
          value={[
            groups.find((t) => t.value === nodeData.type) || {
              value: nodeData.type,
              label: nodeData.type
            },
          ]}
          options={groups}
          error={errors.type}
          onChange={(v) => this.handleChange('type', v?.value || '')}
        />
        <Input
          label="Name"
          value={nodeData.name}
          error={errors.name}
          onChangeText={(v) => this.handleChange('name', v)}
        />
        <Select
          label="Node Type"
          portal
          options={NODE_TYPES}
          isSearchable={false}
          value={NODE_TYPES.find((t) => t.value === nodeData.nodeType)}
          error={errors.nodeType}
          onChange={(v) => this.handleChange('nodeType', v?.value || '')}
        />
        <FileInput
          label="Icon"
          accept=".png,.jpg"
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
