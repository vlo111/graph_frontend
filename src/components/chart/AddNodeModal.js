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
import Outside from '../Outside';
import ColorPicker from '../form/ColorPicker';

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    addNodeParams: PropTypes.object.isRequired,
  }


  initNodeData = memoizeOne(() => {
    const nodes = Chart.getNodes();
    const { nodeData: { type } } = this.state;
    this.setState({
      nodeData: {
        name: '',
        icon: '',
        color: '#0693e3',
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

  constructor(props) {
    super(props);
    this.state = {
      nodeData: {},
      errors: {},
      showColorPicker: null,
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
    if (!nodeData.type) {
      errors.type = 'Type is required';
    }
    if (!nodeData.color) {
      errors.type = 'Color is required';
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

  toggleColorPicker = (ev) => {
    const { showColorPicker } = this.state;
    this.setState({ showColorPicker: !showColorPicker ? ev.target : null });
  }


  render() {
    const { nodeData, errors, showColorPicker } = this.state;
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
        <Input
          label="Name"
          value={nodeData.name}
          error={errors.name}
          onChangeText={(v) => this.handleChange('name', v)}
        />
        <Select
          isClearable
          label="Group"
          value={[
            types.find((t) => t.value === nodeData.type) || { value: nodeData.type, label: nodeData.type },
          ]}
          options={types}
          error={errors.type}
          onChange={(v) => this.handleChange('type', v?.value || '')}
        />
        <FileInput
          label="Icon"
          accept=".png,.jpg,.svg"
          value={nodeData.icon}
          onChangeFile={(v) => this.handleChange('icon', v)}
        />
        <ColorPicker
          label="Color"
          value={nodeData.color}
          style={{ color: nodeData.color }}
          onChangeText={(v) => this.handleChange('color', v)}
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
