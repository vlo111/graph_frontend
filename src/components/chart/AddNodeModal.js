import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import { toggleNodeModal } from '../../store/actions/app';
import { addNodeCustomFieldKey, setNodeCustomField } from '../../store/actions/graphs';
import Select from '../form/Select';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import FileInput from '../form/FileInput';
import { NODE_TYPES } from '../../data/node';
import Validate from '../../helpers/Validate';
import LocationInputs from './LocationInputs';
import Api from "../../Api";

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    setNodeCustomField: PropTypes.func.isRequired,
    addNodeParams: PropTypes.object.isRequired,
  }

  initNodeData = memoizeOne((addNodeParams) => {
    const nodes = Chart.getNodes();
    const {
      fx, fy, name, icon, nodeType, type, keywords, location, index = null, customField = {},
    } = addNodeParams;
    this.setState({
      nodeData: {
        fx,
        fy,
        name: name || '',
        icon: icon || '',
        nodeType: nodeType || 'circle',
        type: type || _.last(nodes)?.type || '',
        keywords: keywords || [],
        location,
      },
      customField,
      index,
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
      nodeData: {
        keywords: [],
      },
      customField: null,
      errors: {},
      index: null,
    };
  }

  closeModal = () => {
    this.props.toggleNodeModal();
  }

  saveNode = async (ev) => {
    ev.preventDefault();
    const { nodeData, index, customField } = this.state;

    const errors = {};
    const nodes = Chart.getNodes();
    let links;

    [errors.name, nodeData.name] = Validate.nodeName(nodeData.name, !_.isNull(index));
    [errors.type, nodeData.type] = Validate.nodeType(nodeData.type);
    [errors.location, nodeData.location] = Validate.nodeLocation(nodeData.location);

    if (!Validate.hasError(errors)) {
      if (_.isNull(index)) {
        nodes.push(nodeData);
      } else {
        const { name: oldName } = nodes[index];
        links = Chart.getLinks().map((d) => {
          if (d.source === oldName) {
            d.source = nodeData.name;
          } else if (d.target === oldName) {
            d.target = nodeData.name;
          }
          return d;
        });

        nodes[index] = nodeData;
      }
      Chart.render({ nodes, links });
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

  handleCustomFieldsChange = (customField) => {
    this.setState({ customField: { ...customField } });
  }

  render() {
    const { nodeData, errors, index } = this.state;
    const { addNodeParams } = this.props;
    this.initNodeData(addNodeParams);
    const nodes = Chart.getNodes();
    const groups = this.getTypes(nodes);
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen={!_.isEmpty(addNodeParams)}
        onRequestClose={this.closeModal}
      >
        <form onSubmit={this.saveNode}>
          <h2>{_.isNull(index) ? 'Add new node' : 'Edit node'}</h2>
          <Select
            isCreatable
            label="Type"
            value={[
              groups.find((t) => t.value === nodeData.type) || {
                value: nodeData.type,
                label: nodeData.type,
              },
            ]}
            limit={250}
            options={groups}
            error={errors.type}
            onChange={(v) => this.handleChange('type', v?.value || '')}
          />
          <Input
            label="Name"
            value={nodeData.name}
            error={errors.name}
            limit={250}
            autoFocus
            onChangeText={(v) => this.handleChange('name', v)}
          />
          <Select
            label="Node Type"
            portal
            options={NODE_TYPES}
            value={NODE_TYPES.filter((t) => t.value === nodeData.nodeType)}
            error={errors.nodeType}
            onChange={(v) => this.handleChange('nodeType', v?.value || '')}
          />
          <FileInput
            label="Icon"
            accept=".png,.jpg,.gif"
            value={nodeData.icon}
            onChangeFile={(v) => this.handleChange('icon', v)}
          />
          <Select
            label="keywords"
            isCreatable
            isMulti
            value={nodeData.keywords.map((v) => ({ value: v, label: v }))}
            menuIsOpen={false}
            placeholder="Add..."
            onChange={(value) => this.handleChange('keywords', (value || []).map((v) => v.value))}
          />
          <LocationInputs
            error={errors.location}
            value={nodeData.location}
            onChange={(v) => this.handleChange('location', v)}
          />
          <div className="buttons">
            <Button onClick={this.closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {_.isNull(index) ? 'Add' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  addNodeParams: state.app.addNodeParams,
});
const mapDispatchToProps = {
  toggleNodeModal,
  setNodeCustomField,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddNodeModal);

export default Container;
